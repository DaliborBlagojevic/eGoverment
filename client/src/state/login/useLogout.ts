import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";


export function useLogout() {
  const navigate = useNavigate();
  return useCallback(() => {
    Cookies.remove("auth.token")
    navigate("/", { replace: true });
  }, [navigate]);
}