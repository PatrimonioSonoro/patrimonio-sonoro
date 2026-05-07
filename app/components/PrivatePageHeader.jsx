import Link from "next/link";

export default function PrivatePageHeader({ title, subtitle }) {
  return (
    <header className="hidden lg:block sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            {title ? (
              <h1 className="text-lg sm:text-xl font-extrabold text-azulInstitucional tracking-tight truncate">{title}</h1>
            ) : null}
            {subtitle ? (
              <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{subtitle}</p>
            ) : null}
          </div>

          <Link
            href="/app/dashboard"
            className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-turquesaAudioBrand text-white text-sm font-extrabold hover:brightness-110 transition"
          >
            Volver al dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}
