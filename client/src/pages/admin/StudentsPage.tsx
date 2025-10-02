// src/pages/admin/UsersRolesPage.tsx (možeš zadržati i stari path/naziv, bitno je da je komponenta ovakva)
import { useEffect, useMemo, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

import Card from "../../components/ui/Card";
import { Input } from "../../components/ui/Form";
import { PrimaryBtn } from "../../components/ui/Buttons";
import { listStudents, listUsers, updateUserRole } from "../../services/housing";

type AnyJwt = Record<string, any>;

// src/models/housing.ts
export type UserRole = "ADMIN" | "STAFF" | "STUDENT";

export type User = {
  id: string;           // uuid ili broj kao string
  firstName: string;
  lastName: string;
  email: string;
  index?: string | null;
  faculty?: string | null;
  role: UserRole;
};

function mapUser(raw: any): User {
  return {
    id: String(raw.id ?? raw.ID ?? raw.userId ?? raw.uuid ?? ""),
    firstName: raw.firstName ?? raw.first_name ?? "",
    lastName: raw.lastName ?? raw.last_name ?? "",
    email: raw.email ?? "",
    index: raw.index ?? null,
    faculty: raw.faculty ?? null,
    role: (raw.role ?? "STUDENT") as UserRole,
  };
}

function getRoleFromToken(): "ADMIN" | "STAFF" | "STUDENT" | null {
  const t = Cookies.get("auth.token");
  if (!t) return null;
  try {
    const d = jwtDecode<AnyJwt>(t);
    const candidates: string[] = [];
    if (typeof d.role === "string") candidates.push(d.role);
    if (Array.isArray(d.roles)) candidates.push(...d.roles.map(String));
    if (typeof d.roles === "string") candidates.push(...d.roles.split(/[,\s]+/));
    if (Array.isArray(d.authorities)) {
      for (const a of d.authorities) {
        if (typeof a === "string") candidates.push(a);
        else if (a && typeof a.authority === "string") candidates.push(a.authority);
      }
    }
    const norm = new Set(
      candidates
        .filter(Boolean)
        .map((s) => s.toUpperCase())
        .map((s) => (s.startsWith("ROLE_") ? s.slice(5) : s))
    );
    if (norm.has("ADMIN")) return "ADMIN";
    if (norm.has("STAFF")) return "STAFF";
    if (norm.has("STUDENT")) return "STUDENT";
    if (norm.has("USER")) return "STUDENT";
    return null;
  } catch {
    return null;
  }
}

const roleOptions: UserRole[] = ["ADMIN", "STAFF", "STUDENT"];

export default function UsersRolesPage() {
  // ✅ opciono: lokalna zaštita na UI (pretpostavljam da je ruta svakako zaštićena na serveru)
  const myRole = useMemo(getRoleFromToken, []);
  const isAdmin = myRole === "ADMIN";

  const [rows, setRows] = useState<User[]>([]);
  const [q, setQ] = useState("");
  const [live, setLive] = useState(true);
  const [intervalMs, setIntervalMs] = useState(10000);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // status per korisnik (za “Saved”, “Error”, spinner…)
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string | null>>({});
  const [dirtyRole, setDirtyRole] = useState<Record<string, UserRole | undefined>>({});

  const load = useCallback(async () => {
    try {
      const res = await listUsers(q, 1, 50);
      // normalizacija raznih oblika
      const arr =
        Array.isArray((res as any)?.rows) ? (res as any).rows :
          Array.isArray((res as any)?.items) ? (res as any).items :
            Array.isArray((res as any)?.students) ? (res as any).students :
              Array.isArray(res as any) ? (res as any) : [];

      setRows(arr.map(mapUser));
      setLastUpdated(Date.now());
    } catch (e) {
      console.error("listUsers failed:", e);
      setRows([]);
    }
  }, [q]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(load, intervalMs);
    return () => clearInterval(id);
  }, [live, intervalMs, load]);

  useEffect(() => {
    const onFocus = () => load();
    const onVis = () => { if (document.visibilityState === "visible") load(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [load]);

  const onRoleChange = async (u: User, newRole: UserRole) => {
    if (!isAdmin) return;
    // optimistički update + per-row state
    setDirtyRole((s) => ({ ...s, [u.id]: newRole }));
    setSaving((s) => ({ ...s, [u.id]: true }));
    setError((s) => ({ ...s, [u.id]: null }));

    try {
      await updateUserRole(u.id, newRole);
      // spoji novi role u rows
      setRows((rs) => rs.map((x) => (x.id === u.id ? { ...x, role: newRole } : x)));
      setDirtyRole((s) => ({ ...s, [u.id]: undefined }));
    } catch (e: any) {
      setError((s) => ({ ...s, [u.id]: e?.message || "Failed to update role" }));
    } finally {
      setSaving((s) => ({ ...s, [u.id]: false }));
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold text-gray-900">Users & Roles</h1>
        <p className="text-sm text-gray-600 mt-2">
          Pristup ograničen. Samo administratori mogu menjati role korisnika.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users & Roles</h1>
          <p className="text-sm text-gray-500">Pregled korisnika i izmena rola</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} />
            Live updates
          </label>
          <select
            className="rounded-xl border border-gray-300 px-2 py-1 text-sm"
            value={intervalMs}
            onChange={(e) => setIntervalMs(Number(e.target.value))}
            title="Auto-refresh interval"
          >
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
            <option value={15000}>15s</option>
            <option value={30000}>30s</option>
          </select>
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Updated: {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        <Card
          title="Users"
          actions={
            <div className="flex items-center gap-2">
              <Input placeholder="Search by name or email…" value={q} onChange={(e) => setQ(e.target.value)} />
              <PrimaryBtn onClick={load}>Refresh</PrimaryBtn>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Index</th>
                  <th className="px-3 py-2 text-left">Faculty</th>
                  <th className="px-3 py-2 text-left">Role</th>
                  <th className="px-3 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((u) => {
                  const current = dirtyRole[u.id] ?? u.role;
                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="px-3 py-2">{u.email}</td>
                      <td className="px-3 py-2">{u.index ?? "—"}</td>
                      <td className="px-3 py-2">{u.faculty ?? "—"}</td>
                      <td className="px-3 py-2">
                        <select
                          className="rounded-xl border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={current}
                          onChange={(e) => onRoleChange(u, e.target.value as UserRole)}
                          disabled={saving[u.id]}
                        >
                          {roleOptions.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {saving[u.id] ? (
                          <span className="text-xs text-gray-500">Saving…</span>
                        ) : error[u.id] ? (
                          <span className="text-xs text-red-600">{error[u.id]}</span>
                        ) : dirtyRole[u.id] ? (
                          <span className="text-xs text-amber-600">Pending…</span>
                        ) : (
                          <span className="text-xs text-emerald-600">✔ Saved</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td className="px-3 py-6 text-center text-gray-500" colSpan={6}>No results</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
