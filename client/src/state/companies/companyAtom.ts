import { atom } from "jotai";
import { Companies, Company } from "../../models/company";

export const companiesAtom = atom<Companies | null>(null);
export const companyAtom = atom<Company | null>(null);
