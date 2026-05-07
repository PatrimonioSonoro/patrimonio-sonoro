"use client";

import { motion } from "framer-motion";
import AudioIndicator from "./AudioIndicator";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

function IconPlay({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function IconClock({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v5l3 2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return null;
  const n = Number(seconds);
  if (!Number.isFinite(n) || n < 0) return null;
  const m = Math.floor(n / 60);
  const s = Math.floor(n % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function SongCard({
  song,
  index,
  isActive,
  isPlaying,
  canPlay,
  isFav,
  favoritesLoading,
  onToggleFav,
  onPlay,
  onToggleCredits,
  creditsOpen,
  children,
}) {
  const durationLabel = formatDuration(song?.duration);

  return (
    <motion.div
      layout
      initial={false}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={cx(
        "group rounded-3xl border p-4 sm:p-5 transition",
        isActive ? "border-white/20" : "border-white/10 hover:border-white/20"
      )}
      style={{
        background: isActive ? "rgba(0,184,169,0.10)" : "rgba(255,255,255,0.04)",
        boxShadow: isActive ? "0 18px 60px rgba(0,0,0,0.28)" : "0 10px 32px rgba(0,0,0,0.18)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 w-16">
          <AudioIndicator active={isActive} playing={isPlaying && isActive} />
          <div className={cx("text-xs font-black", isActive ? "text-white/85" : "text-white/55")}>
            {String(index + 1).padStart(2, "0")}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className={cx("font-extrabold truncate", isActive ? "text-white" : "text-white/95")}>{song.title}</div>
          <div className="text-xs text-white/60 truncate">{song.artist}</div>
        </div>

        {durationLabel ? (
          <div className="hidden sm:flex items-center gap-2 text-xs font-extrabold text-white/55">
            <IconClock className="h-4 w-4" />
            {durationLabel}
          </div>
        ) : (
          <div className="hidden sm:block w-16" />
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={cx(
              "inline-flex items-center justify-center h-10 w-10 rounded-full border transition",
              isFav ? "border-white/25" : "border-white/10 group-hover:border-white/25"
            )}
            style={{
              background: isFav ? "rgba(255, 209, 102, 0.18)" : "rgba(0,0,0,0.30)",
              color: isFav ? "#FFD166" : "rgba(255,255,255,0.85)",
            }}
            title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
            disabled={favoritesLoading}
            onClick={onToggleFav}
          >
            <IconHeart filled={isFav} className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={onPlay}
            className={cx(
              "inline-flex items-center justify-center h-10 w-10 rounded-full border",
              "transition",
              isActive ? "border-white/25" : "border-white/10 group-hover:border-white/25"
            )}
            style={{
              background: isActive ? "#00B8A9" : "rgba(0,0,0,0.30)",
              color: isActive ? "#001A1A" : "#fff",
              opacity: canPlay ? 1 : 0.6,
            }}
            disabled={!canPlay}
            title={!canPlay ? "Cargando URL..." : "Reproducir"}
          >
            <IconPlay className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={onToggleCredits}
            className={cx(
              "text-xs font-extrabold px-3 py-2 rounded-full border transition",
              creditsOpen
                ? "border-white/20 text-white"
                : "border-white/10 hover:border-white/20 text-white/70 hover:text-white"
            )}
            style={{ background: creditsOpen ? "rgba(0,0,0,0.28)" : "rgba(0,0,0,0.18)" }}
          >
            Créditos
          </button>
        </div>
      </div>
    </motion.div>
  );
}
