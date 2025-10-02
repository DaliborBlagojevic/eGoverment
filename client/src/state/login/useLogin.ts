import { HttpService } from "../../services/axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useSetAtom } from "jotai";
import { companyAtom } from "../companies/companyAtom";
import type { LoginRequest, LoginResponse } from "../../models/login";
import type { Company } from "../../models/company";
import { User } from "./useRegister";
import { useCallback } from "react";

type JwtPayload = {
  exp?: number;
  iat?: number;
  id?: number;
  sub?: string;
  role?: string;
};

export const useLogin = () => {
  const navigate = useNavigate();
  const setCompany = useSetAtom(companyAtom);

const getUserById = useCallback(async () => {
  const http = HttpService.getInstance();
  const token = Cookies.get("auth.token");
  if (!token) {
    throw new Error("Nema JWT tokena (auth.token).");
  }

  let userId: number | undefined;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (typeof decoded.id === "number") {
      userId = decoded.id;
    } else if (decoded.sub && /^\d+$/.test(decoded.sub)) {
      userId = Number(decoded.sub);
    }
  } catch {
    // noop
  }

  if (typeof userId !== "number") {
    throw new Error("User ID nije pronađen u tokenu.");
  }

  // ✅ prosledi i drugi parametar {}
  const user = await http.get<User>(`/student-housing/api/students/${userId}`, {});
  console.log(user, "aaa");
  return user;
}, []);

  const login = async (payload: LoginRequest) => {
    const http = HttpService.getInstance();

    let resp: LoginResponse;

    try {
      resp = await http.post<LoginResponse, LoginRequest>("/auth/login", payload);
    } catch (err: any) {
      const msg = err?.message ?? "Greška pri prijavi.";
      if (msg === "Invalid email or password") {
        throw new Error("Pogrešan e-mail ili lozinka!");
      }
      throw new Error(msg);
    }

    const token = resp.access_token;
    const tokenType = resp.token_type || "Bearer";
    const seconds = Number(resp.expires_in) || 0;

    let id: number | undefined;
    let jwtExp: number | undefined;
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      id = decoded.id;
      jwtExp = decoded.exp;
    } catch {
      // ako token nije JWT ili je neispravan – i dalje možemo raditi sa access_token + expires_in
    }

    const cookieExpires =
      jwtExp && jwtExp > 0
        ? new Date(jwtExp * 1000)
        : seconds > 0
          ? new Date(Date.now() + seconds * 1000)
          : undefined;

    Cookies.set("auth.token", token, {
      sameSite: "lax",
      secure: window.location.protocol === "https:",
      expires: cookieExpires,
      path: "/",
    });
    Cookies.set("auth.tokenType", tokenType, {
      sameSite: "lax",
      secure: window.location.protocol === "https:",
      expires: cookieExpires,
      path: "/",
    });

    if (typeof id === "number") {
      const company: Company = {
        id: id,
        companyName: "",
        email: "",
        password: "",
      };
      setCompany(company);
    } else {
      console.warn("JWT nema companyId; preskačem setCompany.");
    }

    navigate("/main");

    return { token, id, tokenType, expiresIn: resp.expires_in };
  };

  return { login, getUserById };
};
