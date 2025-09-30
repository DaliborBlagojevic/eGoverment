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
                        Dobrodošli na glavnu stranicu
                    </h1>
                    <p className="mt-3 max-w-2xl text-gray-600">
                        Ovo je statična ‘landing’ stranica nakon uspešnog logina. Ovde mogu
                        stajati kratka objašnjenja i brzi linkovi ka admin modulima.
                    </p>

                    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900">Open Data</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Brzi pristup javnim datasetovima i pretragama.
                            </p>
                            <div className="mt-4">
                                <a href="#" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium underline">
                                    Otvori modul →
                                </a>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900">Studentski domovi</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Upravljanje smeštajem, prijavama i listama.
                            </p>
                            <div className="mt-4">
                                <Link to="/home/dorms" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium underline">
                                    Otvori modul →
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900">Podešavanja</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Profil, bezbednost, preferencije i integracije.
                            </p>
                            <div className="mt-4">
                                <a href="#" className="text-gray-900 hover:text-black text-sm font-medium underline">
                                    Otvori podešavanja →
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex items-center gap-3">
                        <Link to="/login" className="inline-flex items-center rounded-xl bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-black">
                            Nazad na login
                        </Link>
                        {/* <a href="#" className="text-sm text-gray-600 hover:text-gray-900 underline">
                            Saznaj više o aplikaciji
                        </a> */}
                    </div>
                </div>
            </section>
            <Footer />

        </div>
    );
}
