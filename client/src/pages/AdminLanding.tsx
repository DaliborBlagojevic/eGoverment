import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";

export default function AdminLanding() {
  return (
    <div>
      <Header />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-100 via-white to-emerald-100" />
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">
            Welcome to the dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-gray-600">
            This is a static landing page shown after a successful sign-in. Use it
            for a brief overview and quick links to admin modules.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Open Data</h3>
              <p className="mt-2 text-sm text-gray-600">
                Quick access to public datasets and search tools.
              </p>
              <div className="mt-4">
                <a
                  href="#"
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium underline"
                >
                  Open module →
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Student Dorms</h3>
              <p className="mt-2 text-sm text-gray-600">
                Manage accommodation, applications, and lists.
              </p>
              <div className="mt-4">
                <Link
                  to="/admin/dorms"
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium underline"
                >
                  Open module →
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
              <p className="mt-2 text-sm text-gray-600">
                Profile, security, preferences, and integrations.
              </p>
              <div className="mt-4">
                <a
                  href="#"
                  className="text-gray-900 hover:text-black text-sm font-medium underline"
                >
                  Open settings →
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center rounded-xl bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-black"
            >
              Back to login
            </Link>
            {/* <a href="#" className="text-sm text-gray-600 hover:text-gray-900 underline">
              Learn more about the app
            </a> */}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
