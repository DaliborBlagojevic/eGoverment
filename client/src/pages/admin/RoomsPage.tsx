import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import { Input, Label } from "../../components/ui/Form";
import { PrimaryBtn, DangerBtn } from "../../components/ui/Buttons";
import { listDorms, listRooms, createRoom, deleteRoom } from "../../services/housing";
import type { Dorm, Room } from "../../models/housing";

export default function RoomsPage() {
  const [rows, setRows] = useState<Room[]>([]);
  const [filterDormId, setFilterDormId] = useState("");
  const [dorms, setDorms] = useState<Dorm[]>([]);

  useEffect(() => {
    (async () => {
      const r = await listDorms(1, 1000);
      setDorms(r.rows);
    })();
  }, []);

  async function load() {
    const r = await listRooms({ dormId: filterDormId || undefined, page: 1, pageSize: 50 });
    setRows(r.rows);
  }
  useEffect(() => { load(); }, [filterDormId]);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await createRoom({
      dormId: String(fd.get("dormId") || ""),
      number: String(fd.get("number") || ""),
      capacity: Number(fd.get("capacity") || 0),
      available: Boolean(fd.get("available")),
    });
    e.currentTarget.reset();
    load();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
        <p className="text-sm text-gray-500">Filtriranje, pregled i kreiranje soba</p>
      </div>

      <div className="grid gap-6">
        <Card
          title="Rooms"
          actions={
            <div className="flex gap-2">
              <select
                className="w-64 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={filterDormId}
                onChange={(e) => setFilterDormId(e.target.value)}
              >
                <option value="">All dorms</option>
                {dorms.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <PrimaryBtn onClick={load}>Refresh</PrimaryBtn>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left">Dorm</th>
                  <th className="px-3 py-2 text-left">Number</th>
                  <th className="px-3 py-2 text-left">Capacity</th>
                  <th className="px-3 py-2 text-left">Available</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{dorms.find((d) => d.id === r.dormId)?.name || r.dormId}</td>
                    <td className="px-3 py-2">{r.number}</td>
                    <td className="px-3 py-2">{r.capacity}</td>
                    <td className="px-3 py-2">{r.available ? "Yes" : "No"}</td>
                    <td className="px-3 py-2 text-right">
                      <DangerBtn onClick={() => deleteRoom(r.id).then(load)}>Delete</DangerBtn>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td className="px-3 py-6 text-center text-gray-500" colSpan={5}>No results</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Create room">
          <form onSubmit={onCreate} className="grid gap-3 max-w-xl">
            <div className="grid gap-1">
              <Label>Dorm</Label>
              <select
                name="dormId"
                required
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                defaultValue=""
              >
                <option value="" disabled>Select dorm…</option>
                {dorms.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <Label>Room number</Label>
              <Input name="number" required />
            </div>
            <div className="grid gap-1">
              <Label>Capacity</Label>
              <Input name="capacity" type="number" min={1} required />
            </div>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="available" defaultChecked className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm text-gray-700">Available</span>
            </label>
            <PrimaryBtn type="submit">Create</PrimaryBtn>
          </form>
        </Card>
      </div>
    </div>
  );
}
