import ActionCard from "./ActionCard";

function IconHeadphones(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 13a8 8 0 0116 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 13v5a2 2 0 002 2h1v-7H6a2 2 0 00-2 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13v5a2 2 0 01-2 2h-1v-7h1a2 2 0 012 2z" />
    </svg>
  );
}

function IconGrid(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 3H5a2 2 0 00-2 2v5a2 2 0 002 2h5a2 2 0 002-2V5a2 2 0 00-2-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 3h-5a2 2 0 00-2 2v5a2 2 0 002 2h5a2 2 0 002-2V5a2 2 0 00-2-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5a2 2 0 00-2 2v5a2 2 0 002 2h5a2 2 0 002-2v-5a2 2 0 00-2-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14h-5a2 2 0 00-2 2v5a2 2 0 002 2h5a2 2 0 002-2v-5a2 2 0 00-2-2z" />
    </svg>
  );
}

function IconMap(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v15" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 6v15" />
    </svg>
  );
}

function IconMic(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 013 3v8a3 3 0 11-6 0V4a3 3 0 013-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19v4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 23h8" />
    </svg>
  );
}

function IconSpark(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l3-3 4 8 4-8 3 3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4" />
    </svg>
  );
}

function IconMusic(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18V5l12-2v13" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18a3 3 0 106 0 3 3 0 00-6 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 16a3 3 0 10-6 0 3 3 0 006 0z" />
    </svg>
  );
}

export default function QuickActions() {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-7 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-extrabold text-azulInstitucional">Acciones rápidas</h2>
          <p className="mt-1 text-sm text-gray-600">Atajos para explorar estrategias y descubrir contenido cultural.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-extrabold text-gray-500">
          <span className="h-1.5 w-1.5 rounded-full bg-turquesaAudioBrand" />
          Recomendado
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ActionCard
          href="/app/sonidos"
          title="Explorar estrategias"
          description="Explora imágenes y materiales por estrategia."
          icon={<IconGrid aria-hidden="true" />}
        />
        <ActionCard
          href="/app/albums/campesena"
          title="Álbum CampeSENA"
          description="Escucha el álbum destacado."
          icon={<IconHeadphones aria-hidden="true" />}
        />
        <ActionCard
          href="/app/mapa"
          title="Mapa sonoro"
          description="Explora sonidos por territorio."
          icon={<IconMap aria-hidden="true" />}
        />
        <ActionCard
          href="/app/musicos"
          title="Músicos"
          description="Conecta con perfiles y proyectos."
          icon={<IconMic aria-hidden="true" />}
        />
      </div>
    </div>
  );
}
