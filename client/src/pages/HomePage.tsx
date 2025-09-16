import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLogin } from "../state/login/useLogin";

const HomePage: React.FC = () => {
  const { login } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setErrorMessage("");

    try {
      await login({ email, password });
    } catch (e: any) {
      setErrorMessage(e.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 text-white p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl font-semibold mb-6 text-center">Log in</h2>

        <label htmlFor="email" className="block mb-2 font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-indigo-500"
        />

        <label htmlFor="password" className="block mb-2 font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-indigo-500"
        />
        {errorMessage && (
          <label htmlFor="errorMessage" className="text-red-500">
            {errorMessage}
          </label>
        )}
        <Link
          to="/register"
          className="block text-sm text-indigo-400 hover:text-indigo-300 mb-6  mt-6 text-center underline transition-colors"
        >
          Nemate nalog? Registrujte se.
        </Link>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded font-semibold transition-colors"
        >
          Log in
        </button>
      </form>
    </div>
  );
};

export default HomePage;
