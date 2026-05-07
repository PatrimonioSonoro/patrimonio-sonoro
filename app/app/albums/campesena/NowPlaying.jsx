"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

function IconX({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function IconPlay({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function IconPause({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}

function IconNext({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6 18V6l8.5 6L6 18zM16 6h2v12h-2z" />
    </svg>
  );
}

function IconPrev({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18 6v12l-8.5-6L18 6zM6 6h2v12H6z" />
    </svg>
  );
}

function IconHeart({ className, filled }) {
  return filled ? (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 21s-7.2-4.5-9.6-8.9C.6 8.7 2.1 5.7 5 4.6c2.1-.8 4.4-.1 6 1.5 1.6-1.6 3.9-2.3 6-1.5 2.9 1.1 4.4 4.1 2.6 7.5C19.2 16.5 12 21 12 21z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.8 6.6c-1.3-2.2-4.4-2.9-6.6-1.3-.6.4-1.1 1-1.4 1.6-.3-.6-.8-1.2-1.4-1.6-2.2-1.6-5.3-.9-6.6 1.3-1 1.7-.7 3.9.6 5.4C6 14.9 12 20 12 20s6-5.1 7-8c1.3-1.5 1.6-3.7.8-5.4z" />
    </svg>
  );
}

function formatTime(sec) {
  const n = Number(sec);
  if (!Number.isFinite(n) || n < 0) return "0:00";
  const m = Math.floor(n / 60);
  const s = Math.floor(n % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function NowPlaying({
  open,
  coverUrl,
  song,
  activeUrl,
  isPlaying,
  isFav,
  favoritesLoading,
  onToggleFav,
  onClose,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onOpenCredits,
}) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);

  useEffect(() => {
    if (!open) return;
    const el = document.querySelector("audio");
    if (!el) return;

    const sync = () => {
      if (!scrubbing) setCurrentTime(el.currentTime || 0);
      setDuration(Number.isFinite(el.duration) ? el.duration : 0);
    };

    sync();
    el.addEventListener("timeupdate", sync);
    el.addEventListener("durationchange", sync);
    el.addEventListener("loadedmetadata", sync);
    el.addEventListener("seeked", sync);

    return () => {
      el.removeEventListener("timeupdate", sync);
      el.removeEventListener("durationchange", sync);
      el.removeEventListener("loadedmetadata", sync);
      el.removeEventListener("seeked", sync);
    };
  }, [open, activeUrl, scrubbing]);

  const progress = useMemo(() => {
    if (!duration) return 0;
    return Math.max(0, Math.min(1, currentTime / duration));
  }, [currentTime, duration]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
          tabIndex={-1}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(1200px 700px at 20% 10%, rgba(0,184,169,0.22), transparent 55%), radial-gradient(900px 600px at 90% 30%, rgba(0,45,98,0.35), transparent 60%), linear-gradient(180deg, rgba(0,0,0,0.75), rgba(0,0,0,0.92))",
            }}
          />

          <div className="absolute inset-0 overflow-auto">
            <div className="mx-auto w-full max-w-4xl px-5 sm:px-8 pt-6 pb-10">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-black tracking-widest text-white/60">NOW PLAYING</div>
                  <div className="mt-2 font-extrabold text-white truncate">{song?.title || "Selecciona una canción"}</div>
                  <div className="text-xs text-white/60 truncate">{song?.artist || ""}</div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center h-11 w-11 rounded-2xl border border-white/10 hover:border-white/20 transition"
                  style={{ background: "rgba(0,0,0,0.28)", color: "rgba(255,255,255,0.9)" }}
                  title="Cerrar"
                >
                  <IconX className="h-5 w-5" />
                </button>
              </div>

              <motion.div
                className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr] items-center"
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 14, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <div className="flex justify-center">
                  <div
                    className="w-full max-w-[420px] aspect-square rounded-[2.25rem] border border-white/10 overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.04)", boxShadow: "0 30px 120px rgba(0,0,0,0.65)", backdropFilter: "blur(14px)" }}
                  >
                    {coverUrl ? (
                      <img src={coverUrl} alt="Portada del álbum" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full" style={{ background: "linear-gradient(135deg, rgba(0,45,98,0.8), rgba(0,184,169,0.25))" }} />
                    )}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="rounded-3xl border border-white/10 p-5 sm:p-6" style={{ background: "rgba(18,18,18,0.55)", backdropFilter: "blur(16px)" }}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-black tracking-widest text-white/55">PROGRESO</div>
                        <div className="mt-2 flex items-center justify-between text-[11px] font-black tracking-widest text-white/45">
                          <div>{formatTime(currentTime)}</div>
                          <div>{duration ? formatTime(duration) : "-:--"}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={onToggleFav}
                          className={cx(
                            "inline-flex items-center justify-center h-10 w-10 rounded-2xl border transition",
                            "border-white/10 hover:border-white/20"
                          )}
                          style={{
                            background: isFav ? "rgba(255, 209, 102, 0.18)" : "rgba(0,0,0,0.30)",
                            color: isFav ? "#FFD166" : "rgba(255,255,255,0.85)",
                            opacity: song ? 1 : 0.6,
                          }}
                          title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
                          disabled={!song || favoritesLoading}
                        >
                          <IconHeart filled={isFav} className="h-5 w-5" />
                        </button>

                        <button
                          type="button"
                          onClick={onOpenCredits}
                          className="rounded-2xl px-4 py-2 text-xs font-extrabold border border-white/10 hover:border-white/20 transition"
                          style={{ background: "rgba(0,0,0,0.30)", color: "#fff" }}
                          disabled={!song}
                        >
                          Créditos
                        </button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <input
                        aria-label="Progreso de reproducción"
                        type="range"
                        min={0}
                        max={Math.max(0, Math.floor(duration || 0))}
                        step={1}
                        value={Math.min(Math.floor(currentTime || 0), Math.max(0, Math.floor(duration || 0)))}
                        disabled={!activeUrl || !duration}
                        className="w-full accent-[#00B8A9]"
                        onMouseDown={() => setScrubbing(true)}
                        onMouseUp={() => setScrubbing(false)}
                        onTouchStart={() => setScrubbing(true)}
                        onTouchEnd={() => setScrubbing(false)}
                        onChange={(e) => {
                          const next = Number(e.target.value);
                          setCurrentTime(next);
                          const el = document.querySelector("audio");
                          if (el && Number.isFinite(next)) el.currentTime = next;
                        }}
                      />
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={onPrev}
                        className={cx(
                          "h-14 w-14 rounded-3xl border border-white/10 bg-black/30 text-white/90",
                          "hover:border-white/20 hover:bg-black/40 transition"
                        )}
                        title="Anterior"
                      >
                        <IconPrev className="h-6 w-6 mx-auto" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!activeUrl) return;
                          if (isPlaying) onPause();
                          else onPlay();
                        }}
                        className="h-16 w-16 rounded-3xl border transition"
                        style={{
                          borderColor: "rgba(255,255,255,0.16)",
                          background: activeUrl ? "#00B8A9" : "rgba(0,0,0,0.30)",
                          color: activeUrl ? "#001A1A" : "rgba(255,255,255,0.6)",
                        }}
                        title={isPlaying ? "Pausar" : "Reproducir"}
                        disabled={!activeUrl}
                      >
                        {isPlaying ? <IconPause className="h-7 w-7 mx-auto" /> : <IconPlay className="h-7 w-7 mx-auto" />}
                      </button>

                      <button
                        type="button"
                        onClick={onNext}
                        className={cx(
                          "h-14 w-14 rounded-3xl border border-white/10 bg-black/30 text-white/90",
                          "hover:border-white/20 hover:bg-black/40 transition"
                        )}
                        title="Siguiente"
                      >
                        <IconNext className="h-6 w-6 mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
