"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

function formatTime(sec) {
  const n = Number(sec);
  if (!Number.isFinite(n) || n < 0) return "0:00";
  const m = Math.floor(n / 60);
  const s = Math.floor(n % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function MiniPlayer({ activeSong, activeUrl, isPlaying, onPlay, onPause, onNext, onPrev, onOpenNowPlaying }) {
  const visible = !!activeSong;

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);

  useEffect(() => {
    if (!visible) return;

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
  }, [visible, activeUrl, scrubbing]);

  const progress = useMemo(() => {
    if (!duration) return 0;
    return Math.max(0, Math.min(1, currentTime / duration));
  }, [currentTime, duration]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed left-3 right-3 bottom-3 z-[70] lg:left-[300px] lg:right-6"
        >
          <div
            className="rounded-3xl border border-white/10 px-4 py-3 backdrop-blur"
            style={{
              background: "linear-gradient(135deg, rgba(0,45,98,0.55) 0%, rgba(18,18,18,0.86) 55%, rgba(18,18,18,0.92) 100%)",
              boxShadow: "0 18px 70px rgba(0,0,0,0.45)",
            }}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onOpenNowPlaying?.()}
                className="min-w-0 flex-1 text-left"
                style={{ outline: "none" }}
                title="Abrir Now Playing"
              >
                <div className="text-xs font-black tracking-widest text-white/55">REPRODUCIENDO</div>
                <div className="mt-1 font-extrabold text-white truncate">{activeSong?.title}</div>
                <div className="text-xs text-white/60 truncate">{activeSong?.artist}</div>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onPrev}
                  className={cx(
                    "h-11 w-11 rounded-2xl border border-white/10 bg-black/30 text-white/90",
                    "hover:border-white/20 hover:bg-black/40 transition"
                  )}
                  title="Anterior"
                >
                  <IconPrev className="h-5 w-5 mx-auto" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!activeUrl) return;
                    if (isPlaying) onPause();
                    else onPlay();
                  }}
                  className={cx(
                    "h-11 w-11 rounded-2xl border",
                    "transition"
                  )}
                  style={{
                    borderColor: "rgba(255,255,255,0.16)",
                    background: activeUrl ? "#00B8A9" : "rgba(0,0,0,0.30)",
                    color: activeUrl ? "#001A1A" : "rgba(255,255,255,0.6)",
                  }}
                  title={isPlaying ? "Pausar" : "Reproducir"}
                  disabled={!activeUrl}
                >
                  {isPlaying ? <IconPause className="h-5 w-5 mx-auto" /> : <IconPlay className="h-5 w-5 mx-auto" />}
                </button>

                <button
                  type="button"
                  onClick={onNext}
                  className={cx(
                    "h-11 w-11 rounded-2xl border border-white/10 bg-black/30 text-white/90",
                    "hover:border-white/20 hover:bg-black/40 transition"
                  )}
                  title="Siguiente"
                >
                  <IconNext className="h-5 w-5 mx-auto" />
                </button>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] font-black tracking-widest text-white/45">
                <div>{formatTime(currentTime)}</div>
                <div>{duration ? formatTime(duration) : "-:--"}</div>
              </div>

              <div className="mt-2">
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
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
