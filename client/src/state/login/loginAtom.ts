import { atom } from "jotai";
import { LoginResponse } from "../../models/login";

export const loginAtom = atom<LoginResponse | null>(null);