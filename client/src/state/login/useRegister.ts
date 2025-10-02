import { useCallback } from "react";
import { HttpService } from "../../services/axios";

// prilagodi vrednosti ako tvoj backend koristi drugačije nazive rola
export type Role = "ADMIN" | "STAFF" | "STUDENT";

export interface User {
  ID?: number;                 // gorm primary key
  email?: string;
  username?: string;
  role?: Role;
  index?: string | null;
  firstName?: string;
  lastName?: string;
  faculty?: string | null;
  password?: string;
}


type RegisterResponse = {
  // prilagodi po backendu; često vrati userId ili poruku
  id?: string | number;
  message?: string;
};

export function useRegister() {
  const registerUser = useCallback(async (payload: User) => {
    const http = HttpService.getInstance();
    try {
      // Obrati pažnju: HttpService.post<TResponse, TRequest>(url, body)
      const res = await http.post<RegisterResponse, User>("/auth/users", payload);
      return res;
    } catch (err: any) {
      const apiMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Registracija nije uspela.";
      throw new Error(apiMsg);
    }
  }, []);

  return { registerUser };
}
