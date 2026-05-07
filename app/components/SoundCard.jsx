"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export default function SoundCard({ content }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const regionLabel = useMemo(() => content?.region || "General", [content]);
  const title = content?.title || "Sin título";
  const hasAudio = Boolean(content?.audio_url);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onEnded = () => setIsPlaying(false);
    const onPause = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);

    el.addEventListener("ended", onEnded);
    el.addEventListener("pause", onPause);
    el.addEventListener("play", onPlay);

    return () => {
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("play", onPlay);
    };
  }, []);

  const togglePlay = async () => {
    const el = audioRef.current;
    if (!el || !hasAudio) return;

    try {
      if (el.paused) {
        await el.play();
      } else {
        el.pause();
      }
    } catch (e) {
      console.error("Audio play error", e);
    }
  };

  return (
    <article className="group relative rounded-2xl bg-white ring-1 ring-black/5 shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center rounded-full bg-grisClaro px-3 py-1 text-xs font-semibold text-azulInstitucional">
              {regionLabel}
            </div>
            <h3 className="mt-3 text-base md:text-lg font-extrabold text-azulInstitucional leading-snug line-clamp-2">
              {title}
            </h3>
          </div>

          <button
            type="button"
            onClick={togglePlay}
            disabled={!hasAudio}
            aria-label={hasAudio ? (isPlaying ? "Pausar" : "Reproducir") : "Audio no disponible"}
            className={`shrink-0 h-11 w-11 rounded-full grid place-items-center transition ring-1 ${
              hasAudio
                ? "bg-turquesaAudioBrand text-white ring-black/5 hover:brightness-110"
                : "bg-gray-100 text-gray-400 ring-black/5 cursor-not-allowed"
            }`}
          >
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>

        {content?.description ? (
          <p className="mt-3 text-sm text-gray-600 leading-relaxed line-clamp-2">
            {content.description}
          </p>
        ) : null}

        {hasAudio ? (
          <audio ref={audioRef} preload="none">
            <source src={content.audio_url} type="audio/mpeg" />
            <source src={content.audio_url} type="audio/mp4" />
            <source src={content.audio_url} type="audio/wav" />
          </audio>
        ) : null}
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-turquesaAudioBrand/0 via-turquesaAudioBrand/10 to-turquesaAudioBrand/0" />
    </article>
  );
}
