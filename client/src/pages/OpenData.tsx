// src/pages/OpenDataPage.tsx
import React, { useMemo, useState, useCallback } from "react";
import { ArrowDownTrayIcon, EyeIcon, XMarkIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import Header from "../components/header";
import Footer from "../components/footer";

const API_BASE = import.meta.env.VITE_API_URL ?? ""; // leave empty if reverse proxy routes /open-data to service

type PdfImageCardProps = {
  title: string;
  imgSrc: string;
  imgAlt: string;
  pdfPath: string;
  page?: number;
  pageSize?: number;
  disabled?: boolean;
  onView?: (args: { title: string; pdfPath: string }) => void;
};

function buildPdfUrl(pdfPath: string, page: number, pageSize: number, download = false) {
  const qs = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    ...(download ? { download: "1" } : {}),
  }).toString();
  return `${API_BASE}${pdfPath}?${qs}`;
}

const PdfImageCard: React.FC<PdfImageCardProps> = ({
  title,
  imgSrc,
  imgAlt,
  pdfPath,
  page = 1,
  pageSize = 50,
  disabled = false,
  onView,
}) => {
  const viewUrl = useMemo(() => buildPdfUrl(pdfPath, page, pageSize, false), [pdfPath, page, pageSize]);
  const downloadUrl = useMemo(() => buildPdfUrl(pdfPath, page, pageSize, true), [pdfPath, page, pageSize]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm ${disabled ? "opacity-60 grayscale" : ""}`}>
      <img src={imgSrc} alt={imgAlt} className="h-56 w-full object-cover" loading="lazy" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 flex items-center justify-between">
        <h3 className="text-white font-semibold text-lg drop-shadow">{title}</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => !disabled && onView?.({ title, pdfPath })}
            className={`inline-flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-sm font-medium text-gray-900 backdrop-blur ${disabled ? "pointer-events-none" : "hover:bg-white"}`}
            title="View PDF"
          >
            <EyeIcon className="h-4 w-4" />
            View
          </button>
          <a
            href={disabled ? undefined : downloadUrl}
            className={`inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white ${disabled ? "pointer-events-none" : "hover:bg-emerald-700"}`}
            title="Download PDF"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Download
          </a>
        </div>
      </div>
    </div>
  );
};

type CardMeta = {
  title: string;
  imgSrc: string;
  imgAlt: string;
  pdfPath: string;
  disabled?: boolean;
};

// ✅ Centralno definišemo kartice za SVE endpointe
const CARDS: CardMeta[] = [
  {
    title: "Dorms Directory",
    imgSrc: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop",
    imgAlt: "University dorm building",
    pdfPath: "/open-data/dorms.pdf",
  },
  {
    title: "All Students",
    imgSrc: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop",
    imgAlt: "Students in front of a campus building",
    pdfPath: "/open-data/students.pdf",
  },
  {
    title: "Price Plans",
    imgSrc: "https://images.unsplash.com/photo-1554224155-3a589877462d?q=80&w=1200&auto=format&fit=crop",
    imgAlt: "Price tags and costs",
    pdfPath: "/open-data/price-plans.pdf",
  },
  {
    title: "Daily Availability",
    imgSrc: "https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?q=80&w=1200&auto=format&fit=crop",
    imgAlt: "Calendar availability",
    pdfPath: "/open-data/daily-availability.pdf",
  },
  {
    title: "Application Stats",
    imgSrc: "https://images.unsplash.com/photo-1551281044-8d8d0d8f9b13?q=80&w=1200&auto=format&fit=crop",
    imgAlt: "Application documents and charts",
    pdfPath: "/open-data/application-stats.pdf",
  },
  {
    title: "Payment Stats",
    imgSrc: "https://images.unsplash.com/photo-1554224154-22dec7ec8818?q=80&w=1200&auto=format&fit=crop",
    imgAlt: "Payments and analytics",
    pdfPath: "/open-data/payment-stats.pdf",
  },
  // primer "coming soon" ako neki endpoint još nemaš:
  // {
  //   title: "Applications (Coming Soon)",
  //   imgSrc: "https://source.unsplash.com/1200x600/?application,forms,documents,students",
  //   imgAlt: "Application forms and documents",
  //   pdfPath: "/open-data/applications.pdf",
  //   disabled: true,
  // },
];

const OpenDataPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const [selected, setSelected] = useState<{ title: string; pdfPath: string } | null>(null);

  const onView = useCallback((args: { title: string; pdfPath: string }) => {
    setSelected(args);
  }, []);

  const selectedUrl = useMemo(() => {
    if (!selected) return "";
    return buildPdfUrl(selected.pdfPath, page, pageSize, false);
  }, [selected, page, pageSize]);

  const selectedDownloadUrl = useMemo(() => {
    if (!selected) return "";
    return buildPdfUrl(selected.pdfPath, page, pageSize, true);
  }, [selected, page, pageSize]);

  return (
    <div>
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Open Data</h1>
          <p className="text-gray-500 text-sm">Generate and download PDF reports directly from the Open Data service.</p>
        </div>

        {/* (Opciono) otključaš filtere stranica/pageSize */}
        {/* <div className="mb-6 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page</label>
            <input
              type="number"
              min={1}
              value={page}
              onChange={(e) => setPage(Math.max(1, Number(e.target.value)))}
              className="w-24 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page size</label>
            <input
              type="number"
              min={1}
              max={500}
              value={pageSize}
              onChange={(e) => setPageSize(Math.max(1, Math.min(500, Number(e.target.value))))}
              className="w-28 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div> */}

        {/* ✅ Render svih kartica iz konfiguracije */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <PdfImageCard
              key={card.title}
              title={card.title}
              imgSrc={card.imgSrc}
              imgAlt={card.imgAlt}
              pdfPath={card.pdfPath}
              page={page}
              pageSize={pageSize}
              disabled={card.disabled}
              onView={onView}
            />
          ))}
        </div>

        {/* Inline PDF preview */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
            <div className="flex items-center gap-2">
              {selected && (
                <>
                  <a
                    href={selectedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                    title="Open in new tab"
                  >
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                    Open in new tab
                  </a>
                  <a
                    href={selectedDownloadUrl}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    title="Download PDF"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Download
                  </a>
                </>
              )}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                title="Close preview"
              >
                <XMarkIcon className="h-4 w-4" />
                Close
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            {selected ? (
              <iframe
                key={selectedUrl}
                src={selectedUrl}
                title={selected.title}
                className="h-[80vh] w-full rounded-2xl"
              />
            ) : (
              <div className="p-10 text-center text-gray-500">Select a report card and click “View” to preview the PDF here.</div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OpenDataPage;
