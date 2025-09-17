import { Link } from "react-router-dom";

const Footer = () => {
  const iconClass = "w-6 h-6 stroke-current transition-colors duration-200";

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-gray-800 text-white py-3">
      <div className="flex justify-around">
        <Link
          to="/calendar"
          className="flex flex-col items-center hover:text-indigo-400 transition-colors"
          aria-label="Kalendar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={iconClass}
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="text-sm mt-1">Kalendar</span>
        </Link>

        <Link
          to="/treatment"
          className="flex flex-col items-center hover:text-indigo-400 transition-colors"
          aria-label="Tretmani"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={iconClass}
            aria-hidden="true"
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <circle cx="3" cy="6" r="1" />
            <circle cx="3" cy="12" r="1" />
            <circle cx="3" cy="18" r="1" />
          </svg>
          <span className="text-sm mt-1">Tretmani</span>
        </Link>

        <Link
          to="/customer"
          className="flex flex-col items-center hover:text-indigo-400 transition-colors"
          aria-label="Mušterije"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={iconClass}
            aria-hidden="true"
          >
            <circle cx="12" cy="7" r="4" />
            <path d="M5.5 21a6.5 6.5 0 0113 0" />
          </svg>
          <span className="text-sm mt-1">Mušterije</span>
        </Link>

        <Link
          to="/profile"
          className="flex flex-col items-center hover:text-indigo-400 transition-colors"
          aria-label="Podešavanje"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 stroke-current transition-colors duration-200"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.43 12.98a1.65 1.65 0 00.33-1.82l-.06-.06a2 2 0 01.54-2.83l.06-.06a2 2 0 00-2.83-2.83l-.06.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1-1.51V3a2 2 0 10-4 0v.09a1.65 1.65 0 00-1 1.51 1.65 1.65 0 00-1.82.33l-.06-.06a2 2 0 10-2.83 2.83l.06.06a1.65 1.65 0 00.33 1.82 1.65 1.65 0 00-1.51 1H3a2 2 0 100 4h.09a1.65 1.65 0 001.51 1 1.65 1.65 0 00.33 1.82l-.06.06a2 2 0 102.83 2.83l.06-.06a1.65 1.65 0 001.82-.33h.01a1.65 1.65 0 001 1.51V21a2 2 0 104 0v-.09a1.65 1.65 0 001-1.51 1.65 1.65 0 001.82.33l.06.06a2 2 0 102.83-2.83l-.06-.06a1.65 1.65 0 00-.33-1.82z"
            />
          </svg>
          <span className="text-sm mt-1">Podešavanje</span>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
