import { useEffect, useState } from "react";
import {
  listStudents,
  createStudent,
  deleteStudent,
  listDorms,
  createDorm,
  deleteDorm,
  listRooms,
  createRoom,
  deleteRoom,
  listApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  listPayments,
  createPayment,
  deletePayment,
} from "../services/housing";
import type {
  ApplicationStatus,
  Dorm,
  Room,
  Student,
  Application,
  Payment,
} from "../models/housing";

/* ---------- UI helpers ---------- */

const TabButton = ({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl border transition
      ${
        active
          ? "bg-indigo-600 text-white border-indigo-600 shadow"
          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
      }`}
  >
    {children}
  </button>
);

const Card = ({
  title,
  children,
  actions,
}: {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {actions}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full rounded-xl border border-gray-300 px-3 py-2 text-sm
    placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
      props.className || ""
    }`}
  />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={`w-full rounded-xl border border-gray-300 px-3 py-2 text-sm
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
      props.className || ""
    }`}
  />
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-sm font-medium text-gray-700">{children}</label>
);

const PrimaryBtn = ({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...rest}
    className={`inline-flex items-center justify-center rounded-xl bg-indigo-600 text-white
    hover:bg-indigo-700 disabled:opacity-60 px-4 py-2 text-sm font-medium shadow ${
      rest.className || ""
    }`}
  >
    {children}
  </button>
);

const DangerBtn = ({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...rest}
    className="inline-flex items-center justify-center rounded-xl bg-rose-600 text-white hover:bg-rose-700 px-3 py-1.5 text-xs font-medium"
  >
    {children}
  </button>
);

const StatusBadge = ({ s }: { s: ApplicationStatus }) => {
  const map: Record<ApplicationStatus, string> = {
    SUBMITTED: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
    ACCEPTED:
      "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    REJECTED: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
    RESERVED: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[s]}`}
    >
      {s}
    </span>
  );
};

/* ---------- Page ---------- */

type TabKey = "students" | "dorms" | "rooms" | "applications" | "payments";

export default function AdminPanel() {
  const [tab, setTab] = useState<TabKey>("students");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-500 text-sm">
          Manage students, dorms, rooms, applications and payments
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(
          ["students", "dorms", "rooms", "applications", "payments"] as TabKey[]
        ).map((k) => (
          <TabButton key={k} active={tab === k} onClick={() => setTab(k)}>
            {k.toUpperCase()}
          </TabButton>
        ))}
      </div>

      {tab === "students" && <StudentsTab />}
      {tab === "dorms" && <DormsTab />}
      {tab === "rooms" && <RoomsTab />}
      {tab === "applications" && <ApplicationsTab />}
      {tab === "payments" && <PaymentsTab />}
    </div>
  );
}

/* ---------------- Students ---------------- */

function StudentsTab() {
  const [rows, setRows] = useState<Student[]>([]);
  const [q, setQ] = useState("");

  async function load() {
    const res = await listStudents(q, 1, 20);
    setRows(res.rows);
  }
  useEffect(() => {
    load();
  }, [q]);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    await createStudent({
      index: String(fd.get("index") || ""),
      firstName: String(fd.get("firstName") || ""),
      lastName: String(fd.get("lastName") || ""),
      faculty: String(fd.get("faculty") || ""),
      email: String(fd.get("email") || ""),
    });

    e.currentTarget.reset();
    load();
  }

  return (
    <div className="grid gap-6">
      <Card title="Create student">
        <form onSubmit={onCreate} className="grid gap-3 max-w-xl">
          <div className="grid gap-1">
            <Label>Index</Label>
            <Input name="index" placeholder="e.g. 2021/0001" required />
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
            <Label>Email</Label>
            <Input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="grid gap-1">
            <Label>Faculty</Label>
            <Input name="faculty" required />
          </div>

          <div>
            <PrimaryBtn type="submit">Create</PrimaryBtn>
          </div>
        </form>
      </Card>

      <Card
        title="Students"
        actions={
          <Input
            placeholder="Search by name…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
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
                {/* Ako želiš da vidiš email i u tabeli, otkomentariši sledeće dve linije */}
                {/* <th className="px-3 py-2 text-left">Email</th> */}
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
                  {/* <td className="px-3 py-2">{s.email}</td> */}
                  <td className="px-3 py-2 text-right">
                    <DangerBtn onClick={() => deleteStudent(s.id).then(load)}>
                      Delete
                    </DangerBtn>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    className="px-3 py-6 text-center text-gray-500"
                    colSpan={5}
                  >
                    No results
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Dorms ---------------- */

function DormsTab() {
  const [rows, setRows] = useState<Dorm[]>([]);
  async function load() {
    const r = await listDorms(1, 50);
    setRows(r.rows);
  }
  useEffect(() => {
    load();
  }, []);

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
                    <DangerBtn onClick={() => deleteDorm(d.id).then(load)}>
                      Delete
                    </DangerBtn>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    className="px-3 py-6 text-center text-gray-500"
                    colSpan={3}
                  >
                    No results
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Rooms ---------------- */

function RoomsTab() {
  const [rows, setRows] = useState<Room[]>([]);
  const [filterDormId, setFilterDormId] = useState("");
  const [dorms, setDorms] = useState<Dorm[]>([]);

  // učitaj dorm-ove za select
  useEffect(() => {
    (async () => {
      const r = await listDorms(1, 1000);
      setDorms(r.rows);
    })();
  }, []);

  async function load() {
    const r = await listRooms({
      dormId: filterDormId || undefined,
      page: 1,
      pageSize: 50,
    });
    setRows(r.rows);
  }
  useEffect(() => {
    load();
  }, [filterDormId]);

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
                <option key={d.id} value={d.id}>
                  {d.name}
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
                  <td className="px-3 py-2">
                    {dorms.find((d) => d.id === r.dormId)?.name || r.dormId}
                  </td>
                  <td className="px-3 py-2">{r.number}</td>
                  <td className="px-3 py-2">{r.capacity}</td>
                  <td className="px-3 py-2">{r.available ? "Yes" : "No"}</td>
                  <td className="px-3 py-2 text-right">
                    <DangerBtn onClick={() => deleteRoom(r.id).then(load)}>
                      Delete
                    </DangerBtn>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    className="px-3 py-6 text-center text-gray-500"
                    colSpan={5}
                  >
                    No results
                  </td>
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
              <option value="" disabled>
                Select dorm…
              </option>
              {dorms.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
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
            <input
              type="checkbox"
              name="available"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Available</span>
          </label>
          <PrimaryBtn type="submit">Create</PrimaryBtn>
        </form>
      </Card>
    </div>
  );
}

/* ---------------- Applications ---------------- */

function ApplicationsTab() {
  const [rows, setRows] = useState<Application[]>([]);
  const [filters, setFilters] = useState<{
    studentId?: string;
    dormId?: string;
    status?: ApplicationStatus;
  }>({});

  const statusOptions: ApplicationStatus[] = [
    "SUBMITTED",
    "ACCEPTED",
    "REJECTED",
    "RESERVED",
  ];

  // options
  const [students, setStudents] = useState<Student[]>([]);
  const [dorms, setDorms] = useState<Dorm[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  // učitaj osnovne opcije
  useEffect(() => {
    (async () => {
      const s = await listStudents("", 1, 1000);
      setStudents(s.rows);
      const d = await listDorms(1, 1000);
      setDorms(d.rows);
    })();
  }, []);

  // ako je izabran dorm u formi (za kreiranje), učitaj rooms za taj dorm
  const [createDormId, setCreateDormId] = useState("");
  useEffect(() => {
    (async () => {
      if (createDormId) {
        const r = await listRooms({
          dormId: createDormId,
          page: 1,
          pageSize: 1000,
        });
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
  useEffect(() => {
    load();
  }, [filters]);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await createApplication({
      studentId: String(fd.get("studentId") || ""),
      roomId: (String(fd.get("roomId") || "") || undefined) as any,
      points: Number(fd.get("points") || 0),
      status: String(fd.get("status") || "SUBMITTED") as ApplicationStatus,
    } as any);
    e.currentTarget.reset();
    setCreateDormId(""); // resetuj da očisti rooms
    load();
  }

  async function onUpdate(a: Application, newStatus: ApplicationStatus) {
    await updateApplication(a.id, { status: newStatus });
    load();
  }

  return (
    <div className="grid gap-6">
      <Card
        title="Applications"
        actions={
          <div className="flex gap-2 flex-wrap">
            {/* Filter studentId */}
            <select
              className="w-56 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              defaultValue=""
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  studentId: e.target.value || undefined,
                }))
              }
            >
              <option value="">All students</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} ({s.index})
                </option>
              ))}
            </select>

            {/* Filter dorm (via room) */}
            <select
              className="w-56 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              defaultValue=""
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  dormId: e.target.value || undefined,
                }))
              }
            >
              <option value="">All dorms</option>
              {dorms.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Filter status */}
            <Select
              defaultValue=""
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  status: (e.target.value || undefined) as any,
                }))
              }
            >
              <option value="">All statuses</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
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
              {rows.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    {students.find((s) => s.id === a.studentId)
                      ? `${
                          students.find((s) => s.id === a.studentId)!.firstName
                        } ${
                          students.find((s) => s.id === a.studentId)!.lastName
                        }`
                      : a.studentId}
                  </td>
                  <td className="px-3 py-2">{a.roomId || "-"}</td>
                  <td className="px-3 py-2">{a.points}</td>
                  <td className="px-3 py-2">
                    <StatusBadge s={a.status} />
                  </td>

                  <td className="px-3 py-2 text-right">
                    <div className="flex gap-2 justify-end flex-wrap">
                      {(
                        [
                          "SUBMITTED",
                          "ACCEPTED",
                          "REJECTED",
                          "RESERVED",
                        ] as ApplicationStatus[]
                      )
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
                      <DangerBtn
                        onClick={() => deleteApplication(a.id).then(load)}
                      >
                        Delete
                      </DangerBtn>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    className="px-3 py-6 text-center text-gray-500"
                    colSpan={6}
                  >
                    No results
                  </td>
                </tr>
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
              <select
                name="studentId"
                required
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                defaultValue=""
              >
                <option value="" disabled>
                  Select student…
                </option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} ({s.index})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-1">
              <Label>Dorm (to filter rooms)</Label>
              <select
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={createDormId}
                onChange={(e) => setCreateDormId(e.target.value)}
              >
                <option value="">—</option>
                {dorms.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
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
                  <option key={r.id} value={r.id}>
                    {r.number} (cap: {r.capacity})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-1">
              <Label>Status</Label>
              <Select name="status" defaultValue="SUBMITTED">
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
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
  );
}

/* ---------------- Payments ---------------- */

function PaymentsTab() {
  const [rows, setRows] = useState<Payment[]>([]);
  const [applicationId, setApplicationId] = useState("");

  // za select opcije aplikacija
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    (async () => {
      const r = await listApplications({ page: 1, pageSize: 1000 });
      setApplications(r.rows);
    })();
  }, []);

  async function load() {
    const r = await listPayments({
      applicationId: applicationId || undefined,
      page: 1,
      pageSize: 50,
    });
    setRows(r.rows);
  }
  useEffect(() => {
    load();
  }, [applicationId]);

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
                  {a.id} — {a.status} —{" "}
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
                  <td className="px-3 py-2">
                    {new Date(p.issuedAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <DangerBtn onClick={() => deletePayment(p.id).then(load)}>
                      Delete
                    </DangerBtn>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    className="px-3 py-6 text-center text-gray-500"
                    colSpan={5}
                  >
                    No results
                  </td>
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
              <option value="" disabled>
                Select application…
              </option>
              {applications.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} — {a.status}
                </option>
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
  );
}
