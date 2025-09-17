// src/services/axios.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import {
  EHttpMethod,
  IErrorResponse,
  IParams,
  RefreshTokenResponse,
} from "../types";

interface IError {
  message?: string;
  response?: {
    data?: any; // može biti string ili objekat
    status?: number;
  };
  config?: { url?: string };
  code?: string;
}

class HttpService {
  private static instance: HttpService;
  private http: AxiosInstance;
  private baseURL = import.meta.env.VITE_API_URL;

  private refreshTokenPromise: Promise<string> | null = null;
  private interceptorsInjected = false; // ✅ spreči dupli attach

  private constructor() {
    this.http = axios.create({
      baseURL: this.baseURL,
      withCredentials: false,
      headers: this.setupHeaders(),
    });

    // ✅ odmah ubaci interceptore (da .service() ne bude obavezan)
    this.injectInterceptors();
  }

  public static getInstance(): HttpService {
    if (!HttpService.instance) {
      HttpService.instance = new HttpService();
    }
    return HttpService.instance;
  }

  private get getAuthorization() {
    const accessToken = Cookies.get("auth.token") || "";
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  }

  // Ostavljen za backward-compat; više nije obavezan poziv
  public service() {
    this.injectInterceptors();
    return this;
  }

  private setupHeaders(
    hasAttachment = false,
    additionalHeaders: Record<string, string> = {}
  ) {
    return {
      "Content-Type": hasAttachment
        ? "multipart/form-data"
        : "application/json",
      Accept: "application/json, text/plain, */*",
      ...this.getAuthorization,
      ...additionalHeaders,
    };
  }

  private async request<T>(
    method: EHttpMethod,
    url: string,
    options: AxiosRequestConfig
  ): Promise<T> {
    try {
      if (options.params)
        options.params = this.cleanObject(options.params as IParams);

      const response: AxiosResponse<T> = await this.http.request<T>({
        method,
        url,
        ...options,
      });

      return response.data;
    } catch (error) {
      const normalizedError = this.normalizeError(error as IError);
      return Promise.reject(normalizedError);
    }
  }

  public async get<T>(
    url: string,
    params?: IParams,
    hasAttachment = false,
    signal?: AbortSignal
  ): Promise<T> {
    return this.request<T>(EHttpMethod.GET, url, {
      params,
      headers: this.setupHeaders(hasAttachment),
      signal,
    }).catch((error) => {
      if ((error as any).isNetworkError) {
        console.error("Network error occurred", error.message);
        throw error;
      }
      throw error;
    });
  }

  public async post<T, P>(
    url: string,
    payload: P,
    params?: IParams,
    hasAttachment = false,
    signal?: AbortSignal
  ): Promise<T> {
    return this.request<T>(EHttpMethod.POST, url, {
      params,
      data: payload,
      headers: this.setupHeaders(hasAttachment),
      signal,
    });
  }

  public async put<T, P>(
    url: string,
    payload: P,
    params?: IParams,
    hasAttachment = false
  ): Promise<T> {
    return this.request<T>(EHttpMethod.PUT, url, {
      params,
      data: payload,
      headers: this.setupHeaders(hasAttachment),
    });
  }

  public async patch<T, P>(
    url: string,
    payload: P,
    params?: IParams,
    hasAttachment = false
  ): Promise<T> {
    return this.request<T>(EHttpMethod.PATCH, url, {
      params,
      data: payload,
      headers: this.setupHeaders(hasAttachment),
    });
  }

  public async delete<T, P = T>(
    url: string,
    payload?: P,
    params?: IParams,
    hasAttachment = false
  ): Promise<T> {
    return this.request<T>(EHttpMethod.DELETE, url, {
      params,
      data: payload,
      headers: this.setupHeaders(hasAttachment),
    });
  }

  private injectInterceptors() {
    if (this.interceptorsInjected) return; // ✅ sprečavanje duplikata
    this.interceptorsInjected = true;

    // REQUEST
    this.http.interceptors.request.use(async (request) => {
      try {
        const accessToken = Cookies.get("auth.token");

        if (accessToken === "undefined" || !accessToken) {
          Cookies.remove("auth.token");
        } else if (accessToken && this.isTokenNearExpiry(accessToken)) {
          const newAccessToken = await this.refreshToken();
          request.headers = request.headers ?? {};
          (request.headers as any)[
            "Authorization"
          ] = `Bearer ${newAccessToken}`;
        } else if (accessToken) {
          request.headers = request.headers ?? {};
          (request.headers as any)["Authorization"] = `Bearer ${accessToken}`;
        }

        // // Debug (po želji)
        // console.debug(
        //   "[HTTP OUT]",
        //   (request.method || "").toUpperCase(),
        //   (request.baseURL || "") + (request.url || ""),
        //   (request.headers as any)?.Authorization ? "Auth ✓" : "Auth –"
        // );
      } catch {
        this.handleRefreshTokenFailure();
      }

      return request;
    });

    // RESPONSE
    this.http.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error?.code === "ERR_NETWORK") {
          Cookies.remove("auth.token");
        }

        const status = error?.response?.status;
        const url = (error?.config?.url ?? "") as string;

        // ⛔️ nemoj raditi redirect na /login za auth rute
        const isAuthRoute =
          /\/company\/login|\/v2\/auth\/login|\/v2\/auth\/refresh/i.test(url);

        if (status === 401 && !isAuthRoute) {
          this.handleRefreshTokenFailure();
        }

        const normalizedError = this.normalizeError(error as IError);
        return Promise.reject(normalizedError);
      }
    );
  }

  private normalizeError(error: IError): IErrorResponse {
    const raw = error?.response?.data;
    const serverMessage =
      typeof raw === "string"
        ? raw.trim()
        : raw?.message || raw?.error || raw?.detail;

    return {
      error,
      message: serverMessage || error.message || "Greška na serveru",
      status: error?.response?.status,
    } as IErrorResponse;
  }

  private async refreshToken(): Promise<string> {
    const refreshAxiosInstance = axios.create({
      baseURL: this.baseURL,
      withCredentials: false,
      headers: this.setupHeaders(),
    });
    if (!this.refreshTokenPromise) {
      this.refreshTokenPromise = new Promise<string>(
        async (resolve, reject) => {
          try {
            const response =
              await refreshAxiosInstance.get<RefreshTokenResponse>(
                "/v2/auth/refresh"
              );
            Cookies.set("auth.token", response.data.token, {
              sameSite: "lax",
              secure: window.location.protocol === "https:",
            });
            resolve(response.data.token);
          } catch (error) {
            this.handleRefreshTokenFailure();
            reject(error);
          } finally {
            this.refreshTokenPromise = null;
          }
        }
      );
    }
    return this.refreshTokenPromise;
  }

  private isTokenNearExpiry(token: string) {
    const decoded: { exp: number } = jwtDecode(token);
    if (typeof decoded.exp === "undefined") {
      throw new Error("Token expiration time is missing");
    }
    const expiryTime = decoded.exp * 1000;
    const currentTime = Date.now();
    const buffer = 2 * 60 * 1000; // 2 min
    return expiryTime - currentTime < buffer;
  }

  private handleRefreshTokenFailure() {
    Cookies.remove("auth.token");
    window.location.assign("/login");
  }

  private cleanObject(obj: IParams) {
    Object.keys(obj).forEach((key) => {
      if (obj[key] === undefined) {
        delete obj[key];
      }
    });
    return obj;
  }
}

export { HttpService };
