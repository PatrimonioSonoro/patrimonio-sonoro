import Link from "next/link";

export default function ActionCard({ href, title, description, icon }) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-turquesaAudioBrand/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-turquesaAudioBrand/15"
    >
      <div className="relative flex items-start gap-4">
        <div className="h-11 w-11 shrink-0 rounded-2xl bg-azulInstitucional/5 ring-1 ring-azulInstitucional/10 flex items-center justify-center text-azulInstitucional transition group-hover:bg-turquesaAudioBrand/10 group-hover:text-turquesaAudioBrand">
          {icon ? icon : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-extrabold text-azulInstitucional leading-tight">
            {title}
          </div>
          <div className="text-sm text-gray-600 mt-1 leading-snug">
            {description}
          </div>
        </div>
      </div>
    </Link>
  );
}
