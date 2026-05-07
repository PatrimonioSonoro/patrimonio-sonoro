import React from "react";

export default function NavigationModules() {
  const modules = [
    {
      title: "Buscar sonido",
      description: "Encuentra un sonido por palabra clave y ve directo al banco sonoro.",
      href: "#buscar",
      accent: "from-turquesaAudioBrand/25 via-turquesaAudioBrand/10 to-transparent",
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M21 21l-4.35-4.35" />
          <circle cx="11" cy="11" r="7" />
        </svg>
      ),
    },
    {
      title: "Banco Sonoro",
      description: "Explora sonidos publicados y navega por regiones.",
      href: "/banco-sonoro",
      accent: "from-verdeSena/25 via-verdeSena/10 to-transparent",
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M9 18V5l12-2v13" />
          <path d="M9 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
          <path d="M21 16a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
        </svg>
      ),
    },
    {
      title: "Mapa Sonoro",
      description: "Explora sonidos por ubicación geográfica.",
      href: "/mapa-sonoro",
      accent: "from-amarilloVibrante/25 via-amarilloVibrante/10 to-transparent",
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      ),
    },
    {
      title: "Stock de Músicos",
      description: "Descubre perfiles de músicos y talentos del territorio.",
      href: "/musicos",
      accent: "from-azulInstitucional/25 via-azulInstitucional/10 to-transparent",
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
          <path d="M7 21v-2" />
          <path d="M17 21v-2" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-14 md:py-16 bg-grisClaro">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-azulInstitucional">
              Explora la plataforma
            </h2>
            <p className="mt-2 text-gray-600 max-w-2xl">
              Accesos rápidos a los módulos principales.
            </p>
          </div>
          <a
            href="#inicio"
            className="hidden sm:inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-bold text-azulInstitucional ring-1 ring-black/5 hover:bg-gray-50 transition"
          >
            Volver arriba
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {modules.map((m) => (
            <a
              key={m.href}
              href={m.href}
              className="group relative rounded-2xl bg-white p-5 ring-1 ring-black/5 shadow-sm hover:shadow-md transition overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${m.accent} opacity-0 group-hover:opacity-100 transition`} />
              <div className="relative">
                <div className="h-11 w-11 rounded-2xl bg-grisClaro text-azulInstitucional grid place-items-center ring-1 ring-black/5">
                  {m.icon}
                </div>
                <h3 className="mt-4 font-extrabold text-azulInstitucional">
                  {m.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {m.description}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-turquesaAudioBrand">
                  Ir
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-10 sm:hidden">
          <a
            href="#inicio"
            className="inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-azulInstitucional ring-1 ring-black/5 hover:bg-gray-50 transition"
          >
            Volver arriba
          </a>
        </div>
      </div>
    </section>
  );
}
