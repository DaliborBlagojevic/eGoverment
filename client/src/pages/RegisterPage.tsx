import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "../state/login/useRegister";

const NewRegisterPage: React.FC = () => {
  const { registerUser } = useRegister();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function validate() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Invalid email address.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password))
      return "Password should contain at least one letter and one digit.";
    if (password !== confirm) return "Passwords do not match.";
    if (!firstName.trim() || !lastName.trim())
      return "First name and last name are required.";
    return null;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const err = validate();
    if (err) {
      setErrorMessage(err);
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      // On the server, role is IGNORED and defaults to STUDENT + PENDING
      await registerUser({ firstName, lastName, email, password });
      // After successful registration redirect to login with a query flag
      navigate("/login?registered=1", { replace: true });
    } catch (e: any) {
      setErrorMessage(e?.message ?? "Registration failed.");
    } finally {
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
              Open Data Student Housing Portal
            </div>
            <h1 className="mt-6 text-4xl font-semibold text-emerald-950">
              Create your student account
            </h1>
            <p className="mt-4 text-emerald-900/80">
              Sign up to request access. An administrator will approve your
              account and enable the student portal. You can add your faculty
              and index later on your profile.
            </p>
            <ul className="mt-8 space-y-3 text-emerald-950/80">
              <li className="flex items-center gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-600" />
                Transparent housing availability through open data
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-600" />
                Role-based access for students, staff, and administrators
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-600" />
                Data-driven insights and housing statistics
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
              <span className="text-xl font-bold">O</span>
            </div>
            <h2 className="mt-4 text-3xl font-semibold text-gray-900">
              Register
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Fill in your details to create an account.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-medium text-gray-800"
                >
                  First name
                </label>
                <input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-gray-900
                             shadow-sm outline-none transition
                             focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-medium text-gray-800"
                >
                  Last name
                </label>
                <input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-gray-900
                             shadow-sm outline-none transition
                             focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                Email address
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
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 pr-12 text-gray-900
                             shadow-sm outline-none transition
                             focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute inset-y-0 right-2 my-auto rounded-lg px-2 text-sm text-emerald-700 hover:bg-emerald-50"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Minimum 8 characters, at least one letter and one digit.
              </p>
            </div>

            <div>
              <label
                htmlFor="confirm"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-gray-900
                           shadow-sm outline-none transition
                           focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                placeholder="••••••••"
              />
            </div>

            {/* If you want faculty/index at sign-up, you can add fields here later */}

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
              {submitting ? "Creating account…" : "Create account"}
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-emerald-700 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewRegisterPage;
