import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import { Input, Label } from "../../components/ui/Form";
import { PrimaryBtn, DangerBtn } from "../../components/ui/Buttons";
import { listApplications, listPayments, createPayment, deletePayment } from "../../services/housing";
import type { Application, Payment } from "../../models/housing";

export default function PaymentsPage() {
  const [rows, setRows] = useState<Payment[]>([]);
  const [applicationId, setApplicationId] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    (async () => {
      const r = await listApplications({ page: 1, pageSize: 1000 });
      setApplications(r.rows);
    })();
  }, []);

  async function load() {
    const r = await listPayments({ applicationId: applicationId || undefined, page: 1, pageSize: 50 });
    setRows(r.rows);
  }
  useEffect(() => { load(); }, [applicationId]);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await createPayment({
      applicationId: String(fd.get("applicationId") || ""),
      reference: String(fd.get("reference") || ""),
      amount: Number(fd.get("amount") || 0),
    } as any);
    e.currentTarget.reset();
    load();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-500">Pregled i kreiranje uplate</p>
      </div>

      <div className="grid gap-6">
        <Card
          title="Payments"
          actions={
            <div className="flex gap-2 items-center">
              <select
                className="w-72 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
              >
                <option value="">All applications</option>
                {applications.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} — {a.status}
                  </option>
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
                  <th className="px-3 py-2 text-left">Application</th>
                  <th className="px-3 py-2 text-left">Reference</th>
                  <th className="px-3 py-2 text-left">Amount</th>
                  <th className="px-3 py-2 text-left">Issued</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{p.applicationId}</td>
                    <td className="px-3 py-2">{p.reference}</td>
                    <td className="px-3 py-2">{p.amount}</td>
                    <td className="px-3 py-2">{p.issuedAt ? new Date(p.issuedAt).toLocaleString() : "-"}</td>
                    <td className="px-3 py-2 text-right">
                      <DangerBtn onClick={() => deletePayment(p.id).then(load)}>Delete</DangerBtn>
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

        <Card title="Create payment">
          <form onSubmit={onCreate} className="grid gap-3 max-w-xl">
            <div className="grid gap-1">
              <Label>Application</Label>
              <select
                name="applicationId"
                required
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                defaultValue=""
              >
                <option value="" disabled>Select application…</option>
                {applications.map((a) => (
                  <option key={a.id} value={a.id}>{a.id} — {a.status}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <Label>Reference</Label>
              <Input name="reference" required />
            </div>
            <div className="grid gap-1">
              <Label>Amount</Label>
              <Input type="number" step="0.01" name="amount" required />
            </div>
            <PrimaryBtn type="submit">Create</PrimaryBtn>
          </form>
        </Card>
      </div>
    </div>
  );
}
