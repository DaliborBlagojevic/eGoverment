import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import { Input, Label, Select } from "../../components/ui/Form";
import { PrimaryBtn, DangerBtn } from "../../components/ui/Buttons";
import StatusBadge from "../../components/ui/StatusBadge";
import {
  listStudents,
  listDorms,
  listRooms,
  listApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from "../../services/housing";
import type { ApplicationStatus, Dorm, Room, Student, Application } from "../../models/housing";

export default function ApplicationsPage() {
  const [rows, setRows] = useState<Application[]>([]);
  const [filters, setFilters] = useState<{ studentId?: string; dormId?: string; status?: ApplicationStatus; }>({});
  const statusOptions: ApplicationStatus[] = ["SUBMITTED", "ACCEPTED", "REJECTED", "RESERVED"];

  const [students, setStudents] = useState<Student[]>([]);
  const [dorms, setDorms] = useState<Dorm[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    (async () => {
      const s = await listStudents("", 1, 1000);
      setStudents(s.rows);
      const d = await listDorms(1, 1000);
      setDorms(d.rows);
    })();
  }, []);

  const [createDormId, setCreateDormId] = useState("");
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

  async function load() {
    const r = await listApplications({ ...filters, page: 1, pageSize: 50 });
    setRows(r.rows);
  }
  useEffect(() => { load(); }, [filters]);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await createApplication({
      studentId: Number(fd.get("studentId") || 0),
      roomId: (String(fd.get("roomId") || "") || undefined) as any,
      points: Number(fd.get("points") || 0),
      status: String(fd.get("status") || "SUBMITTED") as ApplicationStatus,
      createdAt: "" as any,
    } as any);
    e.currentTarget.reset();
    setCreateDormId("");
    load();
  }

  async function onUpdate(a: Application, newStatus: ApplicationStatus) {
    await updateApplication(a.id, { status: newStatus });
    load();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-sm text-gray-500">Filtriranje, kreiranje i ažuriranje prijava</p>
      </div>

      <div className="grid gap-6">
        <Card
          title="Applications"
          actions={
            <div className="flex gap-2 flex-wrap">
              <select
                className="w-56 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                defaultValue=""
                onChange={(e) => setFilters((f) => ({ ...f, studentId: e.target.value || undefined }))}
              >
                <option value="">All students</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.index})</option>
                ))}
              </select>

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
                  <th className="px-3 py-2 text-left">Student</th>
                  <th className="px-3 py-2 text-left">Room</th>
                  <th className="px-3 py-2 text-left">Points</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Created</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((a) => {
                  const st = students.find((s) => s.id = a.studentId);
                  return (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">{st ? `${st.firstName} ${st.lastName}` : a.studentId}</td>
                      <td className="px-3 py-2">{a.roomId || "-"}</td>
                      <td className="px-3 py-2">{a.points}</td>
                      <td className="px-3 py-2"><StatusBadge s={a.status} /></td>
                      <td className="px-3 py-2">{/* createdAt render ako ga dobijaš */}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex gap-2 justify-end flex-wrap">
                          {(["SUBMITTED", "ACCEPTED", "REJECTED", "RESERVED"] as ApplicationStatus[])
                            .filter((s) => s !== a.status)
                            .map((s) => (
                              <button
                                key={s}
                                className="rounded-xl border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                                onClick={() => onUpdate(a, s)}
                              >
                                Set {s}
                              </button>
                            ))}
                          <DangerBtn onClick={() => deleteApplication(a.id).then(load)}>Delete</DangerBtn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr><td className="px-3 py-6 text-center text-gray-500" colSpan={6}>No results</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Create application">
          <form onSubmit={onCreate} className="grid gap-3 max-w-2xl">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label>Student</Label>
                <select name="studentId" required className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" defaultValue="">
                  <option value="" disabled>Select student…</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.index})</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1">
                <Label>Dorm (filter rooms)</Label>
                <select
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={createDormId}
                  onChange={(e) => setCreateDormId(e.target.value)}
                >
                  <option value="">—</option>
                  {dorms.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
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

              <div className="grid gap-1">
                <Label>Status</Label>
                <Select name="status" defaultValue="SUBMITTED">
                  {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label>Points</Label>
                <Input type="number" min={0} name="points" />
              </div>
            </div>

            <PrimaryBtn type="submit">Create</PrimaryBtn>
          </form>
        </Card>
      </div>
    </div>
  );
}
