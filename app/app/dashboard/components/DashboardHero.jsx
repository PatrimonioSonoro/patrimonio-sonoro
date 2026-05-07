import Link from "next/link";

export default function DashboardHero({ nombre, stats, onSignOut }) {
  const estrategiasCount = stats?.estrategiasCount ?? 0;
  const favoritosCount = stats?.favoritosCount ?? 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-azulInstitucional p-6 sm:p-8 shadow-xl shadow-black/15">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 -right-24 h-72 w-72 rounded-full bg-turquesaAudioBrand/25 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(800px 260px at 20% 10%, rgba(255,255,255,0.18), transparent 60%)" }} />
      </div>
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold tracking-wide text-white ring-1 ring-white/15">
            <span className="h-2 w-2 rounded-full bg-turquesaAudioBrand" />
            Espacio privado
          </div>

          <h1 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Bienvenido, {nombre || "Usuario"}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/80">
            Aquí encuentras estrategias, imágenes y piezas culturales que preservan nuestro patrimonio sonoro.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold text-white ring-1 ring-white/15">
              <span className="h-2 w-2 rounded-full bg-turquesaAudioBrand" />
              {estrategiasCount} estrategias publicadas
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold text-white ring-1 ring-white/15">
              <span className="h-2 w-2 rounded-full bg-white/70" />
              {favoritosCount} favoritos
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/app/sonidos"
              className="inline-flex items-center justify-center rounded-full bg-turquesaAudioBrand px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-black/20 transition hover:brightness-110 active:scale-[0.99]"
            >
              Explorar estrategias
            </Link>
            <Link
              href="/app/mapa"
              className="inline-flex items-center justify-center rounded-full bg-white/10 px-6 py-3 text-sm font-extrabold text-white ring-1 ring-white/20 transition hover:bg-white/15 active:scale-[0.99]"
            >
              Abrir mapa sonoro
            </Link>
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-extrabold text-azulInstitucional ring-1 ring-black/5 transition hover:bg-gray-50"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
