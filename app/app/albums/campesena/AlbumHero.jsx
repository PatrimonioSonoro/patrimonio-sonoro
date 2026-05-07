"use client";

import { motion } from "framer-motion";

function IconPlay({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function IconHeart({ className, filled }) {
  const common = {
    viewBox: "0 0 24 24",
    className,
    "aria-hidden": true,
  };

  if (filled) {
    return (
      <svg {...common} fill="currentColor">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    );
  }

  return (
    <svg {...common} fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      />
    </svg>
  );
}

export default function AlbumHero({
  coverUrl,
  loadingCover,
  title,
  description,
  subtitle,
  tracksCount,
  onPlayAll,
  onSave,
  canPlay,
  saved,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl border border-white/10"
      style={{ background: "linear-gradient(135deg, #002D62 0%, #215585 40%, #121212 100%)" }}
    >
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(90% 80% at 18% 22%, rgba(0,184,169,0.26) 0%, rgba(0,184,169,0.00) 55%), radial-gradient(70% 60% at 85% 18%, rgba(255,209,102,0.18) 0%, rgba(255,209,102,0.00) 55%), radial-gradient(60% 60% at 70% 85%, rgba(201,43,40,0.12) 0%, rgba(201,43,40,0.00) 55%)",
          }}
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative p-6 sm:p-8 lg:p-10">
        <div className="grid gap-6 lg:gap-10 lg:grid-cols-[260px_1fr]">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="group"
          >
            <div className="relative rounded-3xl overflow-hidden ring-1 ring-white/15 bg-black/30 aspect-square shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
              {coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverUrl} alt={title || "Álbum"} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white/60 text-sm">
                  {loadingCover ? "Cargando portada..." : "Sin portada"}
                </div>
              )}

              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.00) 35%, rgba(0,0,0,0.70) 100%)" }} />
              <div className="absolute left-4 right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-xs font-black tracking-widest text-white/75">PATRIMONIO SONORO</div>
                <div className="mt-1 text-sm font-extrabold text-white/95 truncate">Colección cultural</div>
              </div>
            </div>
          </motion.div>

          <div className="min-w-0">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black tracking-widest text-white/75 backdrop-blur">
              ÁLBUM
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight truncate">
              {title}
            </h1>

            <p className="mt-3 text-sm sm:text-base text-white/80 max-w-3xl">
              {description}
            </p>

            <p className="mt-3 text-sm sm:text-base font-semibold text-white/85 max-w-3xl">
              {subtitle}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onPlayAll}
                disabled={!canPlay}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-extrabold transition"
                style={{ background: "#00B8A9", color: "#001A1A" }}
              >
                <IconPlay className="h-5 w-5" />
                Reproducir todo
              </button>

              <button
                type="button"
                onClick={onSave}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-extrabold border border-white/15 bg-white/5 hover:bg-white/10 transition"
                style={{ color: saved ? "#FFD166" : "#fff" }}
              >
                <IconHeart filled={saved} className="h-5 w-5" />
                Guardar
              </button>

              <div className="text-xs text-white/60">
                {tracksCount} {tracksCount === 1 ? "canción" : "canciones"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
