import React from "react";

export default function Card({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {actions}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
