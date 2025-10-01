import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import type { Role } from "../models/user";
import { JSX } from "react";

type JwtPayload = { exp?: number; role?: Role };

function useAuthSnapshot() {
  const token = Cookies.get("auth.token");
  if (!token) return { isAuthed: false as const, role: undefined as Role | undefined };

  try {
    const { exp, role } = jwtDecode<JwtPayload>(token);
    if (exp && exp * 1000 < Date.now()) {
      return { isAuthed: false as const, role: undefined };
    }
    return { isAuthed: true as const, role };
  } catch {
    // Ako token nije JWT ali ima valjan cookie expiry, tretiraj kao ulogovanog
    return { isAuthed: true as const, role: undefined };
  }
}

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthed } = useAuthSnapshot();
  const location = useLocation();
  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

export function RequireRole({
  children,
  allow,
}: {
  children: JSX.Element;
  allow: Role[];
}) {
  const { isAuthed, role } = useAuthSnapshot();
  const location = useLocation();

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  // Strogo: mora postojati role i biti na allow listi
  if (!role || !allow.includes(role)) {
    return <Navigate to="/403" replace />;
  }
  return children;
}

export function GuestOnly({ children }: { children: JSX.Element }) {
  const { isAuthed } = useAuthSnapshot();
  return isAuthed ? <Navigate to="/home" replace /> : children;
}
