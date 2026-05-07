import PrivatePageHeader from "../../components/PrivatePageHeader";

export const dynamic = 'force-dynamic';

export default function AppMusicosPage() {
  return (
    <main>
      <PrivatePageHeader
        title="Músicos"
        subtitle="Este módulo estará disponible próximamente."
      />

      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-3xl bg-white ring-1 ring-black/5 shadow-[0_22px_70px_rgba(0,0,0,0.10)] overflow-hidden">
              <div className="relative p-6 sm:p-8">
                <div
                  className="pointer-events-none absolute inset-0 opacity-70"
                  aria-hidden="true"
                >
                  <div className="absolute -top-16 -right-20 h-72 w-72 rounded-full blur-3xl" style={{ background: "rgba(0,184,169,0.14)" }} />
                  <div className="absolute -bottom-20 -left-24 h-80 w-80 rounded-full blur-3xl" style={{ background: "rgba(0,45,98,0.10)" }} />
                </div>

                <div className="relative">
                  <div className="inline-flex items-center gap-2 rounded-full bg-azulInstitucional/10 px-4 py-2 text-xs font-extrabold text-azulInstitucional ring-1 ring-azulInstitucional/15">
                    <span className="h-2 w-2 rounded-full bg-turquesaAudioBrand" />
                    Próximamente
                  </div>

                  <h2 className="mt-4 text-2xl md:text-3xl font-extrabold text-azulInstitucional tracking-tight">
                    Stock de Músicos
                  </h2>
                  <p className="mt-3 text-gray-600 max-w-2xl">
                    Aquí podrás explorar perfiles de músicos y talentos del territorio. Por ahora, esta sección está en preparación.
                  </p>

                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="rounded-2xl bg-grisClaro p-5 ring-1 ring-black/5">
                      <div className="text-sm font-extrabold text-azulInstitucional">Lo que podrás hacer</div>
                      <div className="mt-3 space-y-2 text-sm text-gray-700">
                        <div className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-turquesaAudioBrand" />
                          Buscar músicos por nombre, instrumento o proyecto.
                        </div>
                        <div className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-turquesaAudioBrand" />
                          Filtrar por región y género musical.
                        </div>
                        <div className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-turquesaAudioBrand" />
                          Ver fichas con contacto y material audiovisual.
                        </div>
                        <div className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-turquesaAudioBrand" />
                          Guardar perfiles como favoritos.
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white ring-1 ring-black/5 p-5">
                      <div className="text-sm font-extrabold text-azulInstitucional">Vista previa (deshabilitada)</div>

                      <div className="mt-3 space-y-3">
                        <div className="relative">
                          <input
                            value=""
                            readOnly
                            placeholder="Buscar músico..."
                            className="w-full rounded-full bg-gray-100 px-11 py-3 text-sm outline-none ring-1 ring-black/5 text-gray-500"
                          />
                          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path
                                d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <path d="M21 21l-4.2-4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            disabled
                            className="h-11 rounded-2xl bg-gray-100 ring-1 ring-black/5 text-sm font-semibold text-gray-500"
                          >
                            Región
                          </button>
                          <button
                            type="button"
                            disabled
                            className="h-11 rounded-2xl bg-gray-100 ring-1 ring-black/5 text-sm font-semibold text-gray-500"
                          >
                            Instrumento
                          </button>
                        </div>

                        <div className="rounded-2xl bg-gray-50 ring-1 ring-black/5 p-4">
                          <div className="text-xs font-extrabold text-gray-500">Estado</div>
                          <div className="mt-1 text-sm text-gray-600">En construcción</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
