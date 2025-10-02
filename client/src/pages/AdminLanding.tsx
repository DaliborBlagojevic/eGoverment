// src/pages/AdminLanding.tsx
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import React, { useMemo } from "react";

type AnyJwt = Record<string, any>;

function normalizeRoleToken(decoded: AnyJwt): "ADMIN" | "STAFF" | "STUDENT" | null {
  const candidates: string[] = [];

  // common fields
  if (typeof decoded.role === "string") candidates.push(decoded.role);
  if (typeof decoded.roles === "string") candidates.push(...decoded.roles.split(/[,\s]+/));
  if (Array.isArray(decoded.roles)) candidates.push(...decoded.roles.map(String));

  // Spring Security: authorities
  if (Array.isArray(decoded.authorities)) {
    for (const a of decoded.authorities) {
      if (typeof a === "string") candidates.push(a);
      else if (a && typeof a.authority === "string") candidates.push(a.authority);
    }
  }

  // OAuth scopes
  if (typeof decoded.scope === "string") candidates.push(...decoded.scope.split(" "));
  if (Array.isArray(decoded.scope)) candidates.push(...decoded.scope.map(String));
  if (typeof decoded.scopes === "string") candidates.push(...decoded.scopes.split(/[,\s]+/));
  if (Array.isArray(decoded.scopes)) candidates.push(...decoded.scopes.map(String));

  // Normalizacija i strip ROLE_ prefiksa
  const norm = new Set(
    candidates
      .filter(Boolean)
      .map((s) => s.toUpperCase())
      .map((s) => (s.startsWith("ROLE_") ? s.substring(5) : s))
  );

  if (norm.has("ADMIN")) return "ADMIN";
  if (norm.has("STAFF")) return "STAFF";
  // Često "USER" predstavlja studenta – ako imaš specifičan claim "STUDENT", on će raditi direktno.
  if (norm.has("STUDENT")) return "STUDENT";
  if (norm.has("USER")) return "STUDENT";

  return null;
}

export default function AdminLanding() {
  const token = Cookies.get("auth.token");

  const role = useMemo<"ADMIN" | "STAFF" | "STUDENT" | null>(() => {
    if (!token) return null;
    try {
      const decoded = jwtDecode<AnyJwt>(token);
      return normalizeRoleToken(decoded);
    } catch {
      return null;
    }
  }, [token]);

  const showAdmin = role === "ADMIN";
  const showStaff = role === "STAFF";
  const showStudent = role === "STUDENT";

  return (
    <div>
      <Header />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-100 via-white to-emerald-100" />
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">
              Welcome to the dashboard
            </h1>

            {/* Badge sa ulogom (ako postoji) */}
            <div className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700">
              {role ? `Role: ${role}` : "Role: Guest"}
            </div>
          </div>

          <p className="mt-3 max-w-2xl text-gray-600">
            This is a static landing page shown after a successful sign-in. Use it
            for a brief overview and quick links to admin modules.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Open Data – uvek vidljivo */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Open Data</h3>
              <p className="mt-2 text-sm text-gray-600">
                Quick access to public datasets and search tools.
              </p>
              <div className="mt-4">
                <Link
                  to="/open-data"
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium underline"
                >
                  Open module →
                </Link>
              </div>
            </div>

            {/* Staff Panel – samo za STAFF */}
            {showStaff && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">Staff Panel</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Manage applications, and lists.
                </p>
                <div className="mt-4">
                  <Link
                    to="/staff/applications"
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium underline"
                  >
                    Open module →
                  </Link>
                </div>
              </div>
            )}

            {/* Admin Panel – samo za ADMIN */}
            {showAdmin && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">Admin Panel</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Manage applications, and lists.
                </p>
                <div className="mt-4">
                  <Link
                    to="/admin/dorms"
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium underline"
                  >
                    Open module →
                  </Link>
                </div>
              </div>
            )}

            {/* Student Panel – samo za STUDENT */}
            {showStudent && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">Student Panel</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Manage accommodation, and lists.
                </p>
                <div className="mt-4">
                  <Link
                    to="/student/applications"
                    className="text-gray-900 hover:text-black text-sm font-medium underline"
                  >
                    Open settings →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="mt-12 flex items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center rounded-xl bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-black"
            >
              Back to login
            </Link>
          </div>

          {/* Ako želiš poruku kada nema uloge/permisa */}
          {!role && (
            <p className="mt-6 text-sm text-gray-500">
              You are signed in as a guest or your token has no role. Only the Open
              Data module is available.
            </p>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
