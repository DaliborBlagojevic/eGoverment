import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import { Input, Label } from "../../components/ui/Form";
import { PrimaryBtn, DangerBtn } from "../../components/ui/Buttons";
import { listStudents, createStudent, deleteStudent } from "../../services/housing";
import type { Student } from "../../models/housing";

export default function StudentsPage() {
  const [rows, setRows] = useState<Student[]>([]);
  const [q, setQ] = useState("");

  async function load() {
    const res = await listStudents(q, 1, 20);
    setRows(res.rows);
  }
  useEffect(() => { load(); }, [q]);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await createStudent({
      index: String(fd.get("index") || ""),
      firstName: String(fd.get("firstName") || ""),
      lastName: String(fd.get("lastName") || ""),
      faculty: String(fd.get("faculty") || ""),
    });
    e.currentTarget.reset();
    load();
  }

  return (
    <div className="mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <p className="text-sm text-gray-500">Kreiranje i pregled studenata</p>
      </div>

      <div className="grid gap-6">
        <Card title="Create student">
          <form onSubmit={onCreate} className="grid gap-3 max-w-xl">
            <div className="grid gap-1">
              <Label>Index</Label>
              <Input name="index" placeholder="npr. 2021/0001" required />
            </div>
            <div className="grid gap-1">
              <Label>First name</Label>
              <Input name="firstName" required />
            </div>
            <div className="grid gap-1">
              <Label>Last name</Label>
              <Input name="lastName" required />
            </div>
            <div className="grid gap-1">
              <Label>Faculty</Label>
              <Input name="faculty" required />
            </div>
            <PrimaryBtn type="submit">Create</PrimaryBtn>
          </form>
        </Card>

        <Card
          title="Students"
          actions={
            <Input placeholder="Search by name…" value={q} onChange={(e) => setQ(e.target.value)} />
          }
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left">Index</th>
                  <th className="px-3 py-2 text-left">First</th>
                  <th className="px-3 py-2 text-left">Last</th>
                  <th className="px-3 py-2 text-left">Faculty</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{s.index}</td>
                    <td className="px-3 py-2">{s.firstName}</td>
                    <td className="px-3 py-2">{s.lastName}</td>
                    <td className="px-3 py-2">{s.faculty}</td>
                    <td className="px-3 py-2 text-right">
                      <DangerBtn onClick={() => deleteStudent(s.id).then(load)}>Delete</DangerBtn>
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
      </div>
    </div>
  );
}
