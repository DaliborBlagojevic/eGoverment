import React from "react";

export const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-sm font-medium text-gray-700">{children}</label>
);

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full rounded-xl border border-gray-300 px-3 py-2 text-sm
      placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${props.className || ""}`}
  />
);

export const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={`w-full rounded-xl border border-gray-300 px-3 py-2 text-sm
      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${props.className || ""}`}
  />
);
