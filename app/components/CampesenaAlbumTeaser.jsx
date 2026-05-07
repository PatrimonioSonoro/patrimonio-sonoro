"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabasePublic } from "@/lib/supabasePublic";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

function IconLock({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11V7a4 4 0 00-8 0v4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z" />
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

function TrackCard({ title, subtitle, description, accent, locked, isActive, isPlaying, onTogglePlay }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={cx(
        "group rounded-3xl border border-white/10 overflow-hidden",
        "bg-white shadow-xl transition-transform",
        "hover:-translate-y-1"
      )}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className="relative h-52"
        style={{
          background: `radial-gradient(500px 220px at 20% 30%, ${accent}, rgba(15,23,42,0) 60%), linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.88))`,
        }}
      >
        <div className="absolute inset-0 opacity-35" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.10), rgba(255,255,255,0))" }} />
        <div className="absolute left-5 top-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-[11px] font-extrabold tracking-widest text-white/80 ring-1 ring-white/10">
            <IconLock className="h-4 w-4" />
            {locked ? "PREVIEW" : "PLAY"}
          </div>
        </div>

        <div className="absolute inset-x-5 bottom-5">
          <div className="text-lg font-extrabold text-white truncate">{title}</div>
          <div className="text-xs text-white/70 truncate">{subtitle}</div>
        </div>

        <div className="absolute right-5 top-1/2 -translate-y-1/2">
          <button
            type="button"
            className={cx(
              "h-12 w-12 rounded-full border border-white/15",
              "bg-white/90 text-slate-900",
              "grid place-items-center shadow-lg",
              "transition-transform",
              hover ? "scale-105" : "scale-100"
            )}
            title={locked ? "Reproducir preview" : "Reproducir"}
            onClick={onTogglePlay}
          >
            {isActive && isPlaying ? <IconPause className="h-6 w-6" /> : <IconPlay className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="text-sm text-gray-700">{description}</div>
      </div>
    </div>
  );
}

export default function CampesenaAlbumTeaser() {
  const audioRef = useRef(null);
  const [activeTitle, setActiveTitle] = useState(null);
  const [playing, setPlaying] = useState(false);

  const [audioByTitle, setAudioByTitle] = useState({});

  const baseTracks = useMemo(
    () => [
      {
        title: "CampeSENA",
        dbTitle: "Himno CampeSENA",
        subtitle: "Álbum CampeSENA · Patrimonio Sonoro",
        description: "Himno del álbum CampeSENA: Identidad, orgullo y memoria sonora campesina.",
        accent: "rgba(0,184,169,0.85)",
        fallbackSrc: "/audios/audio_home.mp3",
      },
    ],
    []
  );

  const tracks = useMemo(() => {
    return baseTracks.map((t) => ({
      ...t,
      previewSrc: audioByTitle[t.title] || t.fallbackSrc,
    }));
  }, [baseTracks, audioByTitle]);

  const activeTrack = useMemo(() => tracks.find((t) => t.title === activeTitle) || null, [tracks, activeTitle]);

  useEffect(() => {
    let cancelled = false;

    async function loadTrackUrls() {
      try {
        const titles = baseTracks.map((t) => t.dbTitle || t.title);
        const { data, error } = await supabasePublic
          .from("contenidos")
          .select("title,audio_public_url,status,publicly_visible")
          .in("title", titles)
          .eq("status", "published");

        if (error) return;
        if (cancelled) return;

        const map = {};
        for (const row of data || []) {
          if (!row?.title) continue;
          if (row.publicly_visible === false) continue;
          if (!row.audio_public_url) continue;

          const track = baseTracks.find((t) => (t.dbTitle || t.title) === row.title);
          if (!track) continue;
          map[track.title] = row.audio_public_url;
        }
        setAudioByTitle(map);
      } catch (_) {
        // ignore
      }
    }

    loadTrackUrls();
    return () => {
      cancelled = true;
    };
  }, [baseTracks]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);

    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);

    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
    };
  }, []);

  return (
    <section id="album-campesena" className="relative overflow-hidden py-16 md:py-20 bg-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{
            backgroundImage: "url('/images/logo_album.png')",
            filter: "saturate(1.05)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-azulInstitucional/45 via-azulInstitucional/15 to-turquesaAudioBrand/25 opacity-75" />
        <div className="absolute inset-0 bg-white/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/55 to-white/90" />
        <div className="absolute inset-0 opacity-50" style={{ background: "radial-gradient(900px 320px at 30% 0%, rgba(33,85,133,0.28), transparent 60%)" }} />
      </div>

      <div className="relative container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto max-w-2xl rounded-3xl bg-white/60 px-6 py-8 shadow-[0_18px_55px_rgba(0,0,0,0.10)] ring-1 ring-black/5 backdrop-blur-md sm:px-8">
            <div className="mx-auto h-1.5 w-14 rounded-full bg-turquesaAudioBrand" />
            <h2 className="mt-6 text-3xl md:text-4xl font-extrabold text-azulInstitucional">Álbum CampeSENA</h2>
            <div className="mt-3 text-sm text-gray-700">
              Un adelanto del álbum. Para escuchar completo y ver créditos debes iniciar sesión.
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-turquesaAudioBrand px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:brightness-110"
              >
                Crear cuenta
              </a>
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-extrabold text-azulInstitucional shadow-sm transition hover:bg-gray-50"
              >
                Iniciar sesión
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center justify-items-center">
            <div className="w-full max-w-md">
              <div className="relative overflow-hidden rounded-3xl ring-1 ring-black/10 shadow-[0_22px_70px_rgba(0,0,0,0.12)]">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-azulInstitucional/35 via-transparent to-turquesaAudioBrand/30" />
                <img
                  src="/images/canto_tierra_logo.jpeg"
                  alt="Canto Tierra - Identidad del álbum"
                  className="block w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>

            {tracks.map((t) => {
              const isActive = activeTitle === t.title;
              return (
                <div key={t.title} className="w-full max-w-xl">
                  <TrackCard
                    title={t.title}
                    subtitle={t.subtitle}
                    description={t.description}
                    accent={t.accent}
                    locked={true}
                    isActive={isActive}
                    isPlaying={playing}
                    onTogglePlay={async () => {
                      const el = audioRef.current;
                      if (!el) return;

                      if (isActive && !el.paused) {
                        el.pause();
                        return;
                      }

                      setActiveTitle(t.title);
                      const desiredSrc = /^https?:\/\//i.test(t.previewSrc)
                        ? t.previewSrc
                        : window.location.origin + t.previewSrc;
                      if (el.src !== desiredSrc) {
                        el.src = desiredSrc;
                      }

                      try {
                        await el.play();
                      } catch (_) {
                        // ignore autoplay blocking
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-10 mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-gradient-to-r from-azulInstitucional/5 via-white to-turquesaAudioBrand/5 p-6 text-center">
            <div className="text-sm text-gray-700">
              <span className="font-extrabold text-azulInstitucional">Dentro del área privada</span> podrás escuchar el álbum completo,
              guardar favoritos, ver créditos (ficha técnica musical) y una experiencia de reproducción tipo streaming.
            </div>
          </div>
        </div>

        <audio ref={audioRef} preload="none" />
      </div>
    </section>
  );
}
