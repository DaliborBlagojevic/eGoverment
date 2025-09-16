import { HttpService } from "../../services/axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useSetAtom } from "jotai";
import { companyAtom } from "../companies/companyAtom";
import type { LoginRequest, LoginResponse } from "../../models/login";
import type { Company } from "../../models/company";

type JwtPayload = {
  exp: number;
  iat: number;
  companyId: number;
};

export const useLogin = () => {
  const navigate = useNavigate();
  const setCompany = useSetAtom(companyAtom);

  const login = async (payload: LoginRequest) => {
    const http = HttpService.getInstance();

    let token: string;

    try {
      const res = await http.post<LoginResponse, LoginRequest>(
        "/company/login",
        payload
      );
      token = res.token;
    } catch (err: any) {
      console.log(err.message);
      if (err.message == "Invalid email or password") {
        throw new Error("Pogrešan e-mail ili lozinka!");
      } else {
        throw new Error(err.message);
      }
    }

    let companyId: number | undefined;
    let exp: number | undefined;
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      companyId = decoded.companyId;
      exp = decoded.exp;
    } catch {
      throw new Error("Neispravan token sa servera.");
    }

    if (!companyId) {
      throw new Error("companyId nije u tokenu.");
    }

    Cookies.set("auth.token", token, {
      sameSite: "lax",
      secure: window.location.protocol === "https:",
      expires: exp ? new Date(exp * 1000) : undefined,
      path: "/",
    });

    const company: Company = {
      id: companyId,
      companyName: "",
      email: "",
      password: "",
    };
    setCompany(company);

    navigate("/calendar");

    return { token, companyId };
  };

  return { login };
};
