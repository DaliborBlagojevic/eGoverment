export interface IParams {
  [key: string]: string | number | boolean | string[] | undefined;
}

export interface IErrorResponse {
  error: unknown;
  message: string;
  status: number;
}

export interface RefreshTokenResponse {
  token: string;
}

export enum EHttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}
