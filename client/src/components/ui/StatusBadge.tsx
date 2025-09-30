import type { ApplicationStatus } from "../../models/housing";

export default function StatusBadge({ s }: { s: ApplicationStatus }) {
  const map: Record<ApplicationStatus, string> = {
    SUBMITTED: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
    ACCEPTED:  "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    REJECTED:  "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
    RESERVED:  "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[s]}`}>
      {s}
    </span>
  );
}
