"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import { useMediaUrls } from "../../../lib/mediaHooks";

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

function IconTrash({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 11v6" />
    </svg>
  );
}

function IconHeart({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function FavoritosPage() {
  const audioRef = useRef(null);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState(false);

  const audioPaths = useMemo(() => songs.map((s) => s.audio_path).filter(Boolean), [songs]);
  const { urls: audioUrls } = useMediaUrls(audioPaths);

  const [activeSongId, setActiveSongId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeSong = useMemo(() => songs.find((s) => s.id === activeSongId) || null, [songs, activeSongId]);
  const activeUrl = activeSong?.audio_path ? audioUrls?.[activeSong.audio_path] : null;

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (!activeUrl) return;

    if (isPlaying) {
      const p = el.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } else {
      el.pause();
    }
  }, [activeUrl, isPlaying]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data: sess } = await supabase.auth.getSession();
        const token = sess?.session?.access_token;
        if (!token) {
          setError("No autorizado");
          return;
        }

        const favRes = await fetch("/api/favorites/songs", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const favJson = await favRes.json();
        if (!favRes.ok) {
          setError(String(favJson?.error || "No se pudieron cargar los favoritos"));
          return;
        }

        const ids = Array.isArray(favJson?.song_ids) ? favJson.song_ids : [];
        if (!cancelled) setFavoriteIds(new Set(ids));

        if (!ids.length) {
          if (!cancelled) setSongs([]);
          return;
        }

        const { data: rows, error: qErr } = await supabase
          .from("songs")
          .select("id,title,artist,audio_path,album_id")
          .in("id", ids);

        if (qErr) {
          setError("No se pudieron cargar las canciones");
          return;
        }

        const normalized = (rows || []).slice().sort((a, b) => {
          const at = String(a?.title || "");
          const bt = String(b?.title || "");
          return at.localeCompare(bt);
        });

        if (!cancelled) setSongs(normalized);
      } catch (e) {
        if (!cancelled) setError("Error cargando favoritos");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#121212", color: "#fff" }}>
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-28 -right-24 h-80 w-80 rounded-full blur-3xl" style={{ background: "rgba(0,184,169,0.18)" }} />
        <div className="absolute -bottom-40 -left-28 h-96 w-96 rounded-full blur-3xl" style={{ background: "rgba(255,209,102,0.10)" }} />
        <div className="absolute inset-0 opacity-15" style={{ background: "radial-gradient(900px 320px at 20% 10%, rgba(255,255,255,0.18), transparent 60%)" }} />
      </div>
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-10 pb-16">
        <div className="rounded-3xl border border-white/10 overflow-hidden" style={{ background: "linear-gradient(135deg, #002D62 0%, #215585 40%, #121212 100%)" }}>
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-black/30 ring-1 ring-white/10 flex items-center justify-center" style={{ color: "#FFD166" }}>
                <IconHeart className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black tracking-widest text-white/70">BIBLIOTECA</div>
                <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight truncate">Mis favoritos</h1>
                <p className="mt-3 text-sm sm:text-base text-white/80 max-w-3xl">Tus canciones guardadas para volver a escucharlas cuando quieras.</p>
              </div>
              <div className="ml-auto flex flex-col items-end gap-2">
                <div className="text-xs text-white/60">{favoriteIds.size} favoritas</div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black tracking-widest text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#00B8A9" }} />
                  ÁREA PRIVADA
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold tracking-tight">Canciones</h2>
              <div className="text-xs text-white/50">Reproduce desde aquí</div>
            </div>

            {loading && <div className="mt-4 text-white/70 text-sm">Cargando favoritos...</div>}
            {!loading && error && <div className="mt-4 text-sm" style={{ color: "#FFD166" }}>{error}</div>}

            {!loading && !error && songs.length === 0 && (
              <div className="mt-4 text-white/70 text-sm">
                Aún no tienes canciones favoritas.
                <div className="mt-2">
                  <Link href="/app/albums/campesena" className="text-sm font-extrabold" style={{ color: "#00B8A9" }}>
                    Ir al Álbum CampeSENA
                  </Link>
                </div>
              </div>
            )}

            <div className="mt-4 space-y-3">
              {songs.map((song, idx) => {
                const isActive = song.id === activeSongId;
                const url = song.audio_path ? audioUrls?.[song.audio_path] : null;

                return (
                  <div
                    key={song.id}
                    className={cx(
                      "group rounded-2xl border p-4 transition relative overflow-hidden",
                      isActive ? "border-white/20" : "border-white/10 hover:border-white/20"
                    )}
                    style={{
                      background: isActive ? "rgba(255,209,102,0.08)" : "rgba(255,255,255,0.04)",
                      boxShadow: isActive ? "0 18px 60px rgba(0,0,0,0.28)" : "0 10px 32px rgba(0,0,0,0.18)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: "radial-gradient(520px 220px at 20% 20%, rgba(0,184,169,0.14), transparent 60%)" }}
                    />
                    <div className="relative z-10 flex items-center gap-3">
                      <div className="w-8 text-xs font-black text-white/60">{String(idx + 1).padStart(2, "0")}</div>

                      <div className="min-w-0 flex-1">
                        <div className="font-extrabold truncate">{song.title}</div>
                        <div className="text-xs text-white/60 truncate">{song.artist}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (song.id === activeSongId) {
                            setIsPlaying((v) => !v);
                            return;
                          }

                          setActiveSongId(song.id);
                          setIsPlaying(true);
                        }}
                        className={cx(
                          "inline-flex items-center justify-center h-10 w-10 rounded-full border",
                          "transition",
                          isActive ? "border-white/25" : "border-white/10 group-hover:border-white/25"
                        )}
                        style={{ background: isActive ? "#FFD166" : "rgba(0,0,0,0.30)", color: isActive ? "#1A1A1A" : "#fff" }}
                        disabled={!url}
                        title={!url ? "Cargando URL..." : isActive && isPlaying ? "Pausar" : "Reproducir"}
                      >
                        <IconPlay className="h-5 w-5" />
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          if (toggling) return;
                          setToggling(true);
                          const prevIds = favoriteIds;
                          const nextIds = new Set(prevIds);
                          nextIds.delete(song.id);
                          setFavoriteIds(nextIds);
                          if (song.id === activeSongId) {
                            setActiveSongId(null);
                            setIsPlaying(false);
                          }

                          try {
                            const { data: sess } = await supabase.auth.getSession();
                            const token = sess?.session?.access_token;
                            if (!token) throw new Error("No session");

                            const res = await fetch("/api/favorites/songs", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({ song_id: song.id, favorite: false }),
                            });

                            if (!res.ok) {
                              setFavoriteIds(prevIds);
                              return;
                            }

                            setSongs((prev) => prev.filter((s) => s.id !== song.id));
                          } catch (_) {
                            setFavoriteIds(prevIds);
                          } finally {
                            setToggling(false);
                          }
                        }}
                        className={cx(
                          "inline-flex items-center justify-center h-10 w-10 rounded-full border transition",
                          "border-white/10 group-hover:border-white/25"
                        )}
                        style={{ background: "rgba(0,0,0,0.22)", color: "rgba(255,255,255,0.85)" }}
                        title="Quitar de favoritos"
                        disabled={toggling}
                      >
                        <IconTrash className="h-5 w-5" />
                      </button>

                      <Link
                        href={`/app/albums/campesena`}
                        className="text-xs font-extrabold px-3 py-2 rounded-full border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition"
                        title="Ver álbum"
                      >
                        Álbum
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="lg:sticky lg:top-6 h-fit">
            <div className="rounded-3xl border border-white/10 overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="p-5">
                <div className="text-xs font-black tracking-widest text-white/60">REPRODUCTOR</div>

                <div className="mt-3">
                  <div className="font-extrabold truncate">{activeSong?.title || "Selecciona una canción"}</div>
                  <div className="text-xs text-white/60 truncate">{activeSong?.artist || ""}</div>
                </div>

                <div className="mt-4">
                  {activeUrl ? (
                    <audio
                      ref={audioRef}
                      src={activeUrl}
                      controls
                      className="w-full"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => setIsPlaying(false)}
                    />
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/70">
                      {loading ? "Cargando..." : "Elige una canción para reproducir"}
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="text-xs text-white/60 font-black">Estado</div>
                  <div className="mt-1 text-sm font-extrabold" style={{ color: isPlaying ? "#00B8A9" : "rgba(255,255,255,0.70)" }}>
                    {isPlaying ? "Reproduciendo" : "Pausado"}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
