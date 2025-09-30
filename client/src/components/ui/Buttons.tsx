import React from "react";

export const PrimaryBtn = ({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...rest}
    className={`inline-flex items-center justify-center rounded-xl bg-indigo-600 text-white
      hover:bg-indigo-700 disabled:opacity-60 px-4 py-2 text-sm font-medium shadow ${className || ""}`}
  >
    {children}
  </button>
);

export const DangerBtn = ({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...rest}
    className={`inline-flex items-center justify-center rounded-xl bg-rose-600 text-white
      hover:bg-rose-700 px-3 py-1.5 text-xs font-medium ${className || ""}`}
  >
    {children}
  </button>
);
