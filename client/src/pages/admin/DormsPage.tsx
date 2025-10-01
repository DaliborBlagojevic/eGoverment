import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import { Input, Label } from "../../components/ui/Form";
import { PrimaryBtn, DangerBtn } from "../../components/ui/Buttons";
import { listDorms, createDorm, deleteDorm } from "../../services/housing";
import type { Dorm } from "../../models/housing";

export default function DormsPage() {
  const [rows, setRows] = useState<Dorm[]>([]);
  async function load() {
    const r = await listDorms(1, 50);
    setRows(r.rows);
  }
  useEffect(() => { load(); }, []);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await createDorm({
      name: String(fd.get("name") || ""),
      address: String(fd.get("address") || ""),
    });
    e.currentTarget.reset();
    load();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dorms</h1>
        <p className="text-sm text-gray-500">Kreiranje i pregled domova</p>
      </div>

      <div className="grid gap-6">
        <Card title="Create dorm">
          <form onSubmit={onCreate} className="grid gap-3 max-w-xl">
            <div className="grid gap-1">
              <Label>Name</Label>
              <Input name="name" required />
            </div>
            <div className="grid gap-1">
              <Label>Address</Label>
              <Input name="address" required />
            </div>
            <PrimaryBtn type="submit">Create</PrimaryBtn>
          </form>
        </Card>

        <Card title="Dorms">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Address</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{d.name}</td>
                    <td className="px-3 py-2">{d.address}</td>
                    <td className="px-3 py-2 text-right">
                      <DangerBtn onClick={() => deleteDorm(d.id).then(load)}>Delete</DangerBtn>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td className="px-3 py-6 text-center text-gray-500" colSpan={3}>No results</td>
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
