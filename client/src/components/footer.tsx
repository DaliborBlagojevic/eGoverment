import React from "react";

const Footer: React.FC = () => {
    return (
        <div >
            {/* Footer */}
            <footer className="border-t border-gray-200 py-6">
                <div className="mx-auto max-w-6xl px-4 text-xs text-gray-500">
                    © {new Date().getFullYear()} eGovernment — Sva prava zadržana.
                </div>
            </footer>
        </div>
    );
};

export default Footer;
