import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../state/login/useLogin";

const NewLoginPage: React.FC = () => {
  const { login } = useLogin();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErrorMessage("");

    try {
      await login({ email, password });
      navigate("/home", { replace: true }); // redirect na /home
    } catch (err: any) {
      setErrorMessage(err?.message ?? "Neuspešna prijava.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh grid lg:grid-cols-2">
      {/* Left hero panel */}
      <div className="relative hidden lg:block">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-200 via-teal-100 to-white" />
        <div className="absolute -top-10 -left-10 h-64 w-64 rounded-full bg-emerald-300/40 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-teal-300/40 blur-3xl" />

        <div className="flex h-full items-center p-14">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-sm text-emerald-700 ring-1 ring-emerald-600/20">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Secure Portal
            </div>
            <h1 className="mt-6 text-4xl font-semibold text-emerald-950">
              Dobrodošli nazad 👋
            </h1>
            <p className="mt-4 text-emerald-900/80">
              Prijavite se da biste pristupili kontrolnoj tabli, statistici i
              svim alatima. Brzo, sigurno i jednostavno.
            </p>
            <ul className="mt-8 space-y-3 text-emerald-950/80">
              <li className="flex items-center gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-600" />
                Dvofaktorska zaštita (opciono)
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-600" />
                Role-based pristup
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-600" />
                Audit & istorija aktivnosti
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex min-h-dvh items-center justify-center bg-white p-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <span className="text-xl font-bold">E</span>
            </div>
            <h2 className="mt-4 text-3xl font-semibold text-gray-900">
              Prijava
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Unesite vaše podatke za pristup nalogu.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                Email adresa
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-gray-900
                           shadow-sm outline-none transition
                           focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-800"
                >
                  Lozinka
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-emerald-700 hover:underline"
                >
                  Zaboravljena lozinka?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-gray-900
                           shadow-sm outline-none transition
                           focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                placeholder="••••••••"
              />
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3
                         font-semibold text-white shadow-sm transition
                         hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60
                         focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              {submitting ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Prijavljivanje…
                </>
              ) : (
                "Prijavi se"
              )}
            </button>

            <p className="text-center text-sm text-gray-600">
              Nemate nalog?{" "}
              <Link
                to="/register"
                className="font-medium text-emerald-700 hover:underline"
              >
                Registrujte se
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewLoginPage;
