// src/pages/students/ApplicationsPageStudent.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

import Card from "../../components/ui/Card";
import { Input, Label, Select } from "../../components/ui/Form";
import { PrimaryBtn, DangerBtn } from "../../components/ui/Buttons";
import StatusBadge from "../../components/ui/StatusBadge";

import {
  listDorms,
  listRooms,
  listApplications,
  createApplication,
  deleteApplication,
} from "../../services/housing";

import type { ApplicationStatus, Dorm, Room, Application } from "../../models/housing";

type AnyJwt = Record<string, any>;

function getMyStudentIdFromToken(): string | null {
  const token = Cookies.get("auth.token");
  if (!token) return null;
  try {
    const decoded = jwtDecode<AnyJwt>(token);
    // preferiraj claim koji već imaš (UUID ili string ID)
    if (typeof decoded.studentId === "string" && decoded.studentId) return decoded.studentId;
    if (typeof decoded.studentId === "number") return String(decoded.studentId);
    if (typeof decoded.id === "string" && decoded.id) return decoded.id;
    if (typeof decoded.id === "number") return String(decoded.id);
    if (typeof decoded.sub === "string" && decoded.sub) return decoded.sub;
    return null;
  } catch {
    return null;
  }
}

export default function ApplicationsPageStudent() {
  const myStudentId = useMemo(getMyStudentIdFromToken, []);

  const [rows, setRows] = useState<Application[]>([]);
  const [filters, setFilters] = useState<{ dormId?: string; status?: ApplicationStatus }>({});
  const statusOptions: ApplicationStatus[] = ["SUBMITTED", "ACCEPTED", "REJECTED", "RESERVED"];

  const [dorms, setDorms] = useState<Dorm[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [createDormId, setCreateDormId] = useState("");

  // 🔁 Live updates (polling)
  const [live, setLive] = useState(true);
  const [intervalMs, setIntervalMs] = useState(10000);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const d = await listDorms(1, 1000);
      setDorms(d.rows);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (createDormId) {
        const r = await listRooms({ dormId: createDormId, page: 1, pageSize: 1000 });
        setRooms(r.rows);
      } else {
        setRooms([]);
      }
    })();
  }, [createDormId]);

  const load = useCallback(async () => {
    if (!myStudentId) return;
    const r = await listApplications({
      studentId: myStudentId,           // ✅ samo moje prijave
      dormId: filters.dormId,
      status: filters.status,
      page: 1,
      pageSize: 50,
    });
    setRows(r.rows);
    setLastUpdated(Date.now());
  }, [myStudentId, filters]);

  // inicijalno + na promenu filtera
  useEffect(() => { load(); }, [load]);

  // 🔁 polling kada je live uključen
  useEffect(() => {
    if (!live || !myStudentId) return;
    const id = setInterval(() => { load(); }, intervalMs);
    return () => clearInterval(id);
  }, [live, myStudentId, intervalMs, load]);

  // ♻️ osveži kad tab postane vidljiv / prozor dobije fokus
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

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!myStudentId) return;

    const fd = new FormData(e.currentTarget);
    const roomIdRaw = String(fd.get("roomId") || "");
    const roomId = roomIdRaw ? roomIdRaw : null;

    await createApplication({
      studentId: Number(myStudentId),        // ✅ string/UUID iz tokena (NE Number(...))
      roomId,                        // ✅ null ili UUID string
      points: Number(fd.get("points") || 0),
      status: "SUBMITTED",
    } as any);

    e.currentTarget.reset();
    setCreateDormId("");
    load(); // odmah osveži nakon kreiranja
  }

  if (!myStudentId) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold text-gray-900">Applications</h1>
        <p className="text-sm text-gray-600 mt-2">
          Nema validnog korisničkog ID-a u tokenu. Prijavi se ponovo.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
            <p className="text-sm text-gray-500">Pregled i kreiranje sopstvenih prijava</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={live}
                onChange={(e) => setLive(e.target.checked)}
              />
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
      </div>

      <div className="grid gap-6">
        <Card
          title="My Applications"
          actions={
            <div className="flex gap-2 flex-wrap">
              <select
                className="w-56 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                defaultValue=""
                onChange={(e) => setFilters((f) => ({ ...f, dormId: e.target.value || undefined }))}
              >
                <option value="">All dorms</option>
                {dorms.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>

              <Select
                defaultValue=""
                onChange={(e) => setFilters((f) => ({ ...f, status: (e.target.value || undefined) as any }))}
              >
                <option value="">All statuses</option>
                {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>

              <PrimaryBtn onClick={load}>Refresh</PrimaryBtn>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left">Room</th>
                  <th className="px-3 py-2 text-left">Points</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Created</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{a.roomId || "—"}</td>
                    <td className="px-3 py-2">{a.points}</td>
                    <td className="px-3 py-2"><StatusBadge s={a.status} /></td>
                    {/* <td className="px-3 py-2">
                      {a.createdAt ? new Date(a.createdAt).toLocaleString() : "—"}
                    </td> */}
                    <td className="px-3 py-2 text-right">
                      <div className="flex gap-2 justify-end flex-wrap">
                        <DangerBtn onClick={() => deleteApplication(a.id).then(load)}>Delete</DangerBtn>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td className="px-3 py-6 text-center text-gray-500" colSpan={5}>No results</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Create application" >
          <form onSubmit={onCreate} className="grid gap-3 max-w-2xl">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label>Dorm (filter rooms)</Label>
                <select
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={createDormId}
                  onChange={(e) => setCreateDormId(e.target.value)}
                  required
                >
                  <option value="">— select dorm —</option>
                  {dorms.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div className="grid gap-1">
                <Label>Room (optional)</Label>
                <select
                  name="roomId"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  defaultValue=""
                  disabled={!createDormId}
                >
                  <option value="">—</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>{r.number} (cap: {r.capacity})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label>Points</Label>
                <Input type="number" min={0} name="points" />
              </div>

              <div className="grid gap-1">
                <Label>Status</Label>
                <Input value="SUBMITTED" readOnly className="bg-gray-50" />
              </div>
            </div>

            <PrimaryBtn type="submit">Create</PrimaryBtn>
          </form>
        </Card>
      </div>
    </div>
  );
}
