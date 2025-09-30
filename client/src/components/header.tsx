import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
    return (
        <div >

            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
                <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white grid place-items-center font-bold">
                            E
                        </div>
                        <span className="font-semibold text-gray-900">eGovernment</span>
                    </div>
                    <nav className="hidden sm:flex items-center gap-6 text-sm">
                        <Link to="/home" className="text-gray-900 font-medium">
                            Home
                        </Link>
                        <Link to="/home" className="text-gray-600 hover:text-gray-900">
                            Dokumentacija
                        </Link>
                        <Link to="/login" className="text-red-600 hover:text-red-900">
                            Logout
                        </Link>
                    </nav>
                </div>
            </header>
        </div>
    );
};

export default Header;
