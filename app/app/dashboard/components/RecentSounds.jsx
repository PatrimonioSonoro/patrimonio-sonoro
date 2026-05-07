import Link from "next/link";

export default function RecentSounds({ sounds }) {
  const items = Array.isArray(sounds) ? sounds : [];

  return (
    <div className="mt-10 rounded-3xl border border-gray-200 bg-white p-6 sm:p-7 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-extrabold text-azulInstitucional">Estrategias recientes</h2>
          <p className="mt-1 text-sm text-gray-600">Lo último que se ha publicado en las diferentes estrategias.</p>
        </div>
        <Link
          href="/app/sonidos"
          className="text-sm font-extrabold text-turquesaAudioBrand hover:underline underline-offset-4"
        >
          Ver todas
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 ring-1 ring-black/5 p-6">
          <div className="text-sm font-extrabold text-azulInstitucional">Aún no hay estrategias recientes</div>
          <div className="mt-1 text-sm text-gray-600">
            Explora la sección de estrategias para descubrir contenidos disponibles.
          </div>
          <div className="mt-4">
            <Link
              href="/app/sonidos"
              className="inline-flex items-center justify-center rounded-full bg-turquesaAudioBrand px-6 py-3 text-sm font-extrabold text-white hover:brightness-110 transition"
            >
              Explorar estrategias
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((s) => (
            <Link
              key={s.id}
              href="/app/sonidos"
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-turquesaAudioBrand/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-turquesaAudioBrand/15"
            >
              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-azulInstitucional line-clamp-2">
                      {s.title || "Sin título"}
                    </div>
                    <div className="mt-2 inline-flex items-center rounded-full bg-azulInstitucional/5 px-3 py-1 text-xs font-extrabold text-azulInstitucional ring-1 ring-azulInstitucional/10">
                      {s.region || "Estrategia"}
                    </div>
                  </div>

                  <div className="h-11 w-11 shrink-0 rounded-2xl bg-azulInstitucional/5 ring-1 ring-azulInstitucional/10 flex items-center justify-center text-azulInstitucional transition group-hover:bg-turquesaAudioBrand/10 group-hover:text-turquesaAudioBrand">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18V5l12-2v13" />
                      <circle cx="7" cy="18" r="2" />
                      <circle cx="19" cy="16" r="2" />
                    </svg>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs font-extrabold text-gray-600">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-turquesaAudioBrand" />
                    Ver contenido
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="font-bold text-gray-500">Abrir en Estrategias</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
