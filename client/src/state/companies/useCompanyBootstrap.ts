// src/state/companies/useCompanyBootstrap.ts
import { useEffect } from "react";
import Cookies from "js-cookie";
import { useSetAtom } from "jotai";
import { companyAtom } from "./companyAtom";
import { HttpService } from "../../services/axios";
import type { Company } from "../../models/company";

export function useCompanyBootstrap() {
  const setCompany = useSetAtom(companyAtom);

  useEffect(() => {
    const token = Cookies.get("auth.token");
    if (!token) {
      setCompany(null);
      return;
    }

    (async () => {
      const http = HttpService.getInstance();
      try {
        const company = await http.get<Company>("/companies/me");
        setCompany(company);
      } catch (e) {
        console.error("Loading company on bootstrap failed:", e);
        setCompany(null);
      }
    })();
  }, [setCompany]);
}
