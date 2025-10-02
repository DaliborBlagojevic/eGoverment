import { NavLink, Outlet } from "react-router-dom";
import Header from "../../components/header";
import Footer from "../../components/footer";

const NavItem = ({ to, label, icon }: { to: string; label: string; icon?: React.ReactNode }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium
       ${isActive ? "bg-gray-900 text-white shadow" : "text-gray-700 hover:bg-gray-100"}`
        }
    >
        {icon}
        <span>{label}</span>
    </NavLink>
);

export default function AdminLayout() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Layout */}
            <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-12 gap-6">
                {/* Sidebar */}
                <aside className="col-span-12 lg:col-span-3">
                    <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm sticky top-20">
                        <nav className="grid gap-1">
                            <NavItem to="/student/students" label="Students" />
                        </nav>
                    </div>
                </aside>

                {/* Content */}
                <main className="col-span-12 lg:col-span-9">
                    <Outlet />
                </main>

            </div>
            <Footer />
        </div>
    );
}
