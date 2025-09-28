import React from "react";
import { Link } from "react-router-dom";

const MainPage: React.FC = () => {
  return (
    <div className="min-h-dvh bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white grid place-items-center font-bold">
              E
            </div>
            <span className="font-semibold text-gray-900">eGovernment</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <Link to="/main" className="text-gray-900 font-medium">
              Početna
            </Link>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Dokumentacija
            </a>
            <a href="/admin" className="text-gray-600 hover:text-gray-900">
              Pomoć
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-100 via-white to-emerald-100" />
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">
            Dobrodošli na glavnu stranicu
          </h1>
          <p className="mt-3 max-w-2xl text-gray-600">
            Ovo je statična „landing” stranica nakon uspešnog logina. Ovdе može
            stajati kratko objašnjenje, linkovi ka sekcijama aplikacije ili brzi
            pregledi.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Open Data</h3>
              <p className="mt-2 text-sm text-gray-600">
                Brzi pristup javnim datasetovima i pretragama.
              </p>
              <div className="mt-4">
                <a
                  href="#"
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium underline"
                >
                  Otvori modul →
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">
                Student Housing
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Upravljanje smeštajem, prijavama i listama.
              </p>
              <div className="mt-4">
                <a
                  href="#"
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium underline"
                >
                  Otvori modul →
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">
                Podešavanja
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Profil, bezbednost, preferencije i integracije.
              </p>
              <div className="mt-4">
                <a
                  href="#"
                  className="text-gray-900 hover:text-black text-sm font-medium underline"
                >
                  Otvori podešavanja →
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center rounded-xl bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-black"
            >
              Nazad na login
            </Link>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Saznaj više o aplikaciji
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6">
        <div className="mx-auto max-w-6xl px-4 text-xs text-gray-500">
          © {new Date().getFullYear()} eGovernment — Sva prava zadržana.
        </div>
      </footer>
    </div>
  );
};

export default MainPage;
