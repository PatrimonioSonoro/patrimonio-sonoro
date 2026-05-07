"use client";

import { useEffect, useMemo, useState } from "react";
import { useAlbumByTitle, useAlbumFull } from "../../../../lib/albumsHooks";
import { useMediaUrl, useMediaUrls } from "../../../../lib/mediaHooks";
import { supabase } from "../../../../lib/supabaseClient";
import AlbumHero from "./AlbumHero";
import SongCard from "./SongCard";
import CreditsPanel from "./CreditsPanel";
import MiniPlayer from "./MiniPlayer";
import CreditsModal from "./CreditsModal";
import NowPlaying from "./NowPlaying";

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

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

export default function CampeSenaAlbumPage() {
  const { album: albumRow, loading: findingAlbum, error: findErr } = useAlbumByTitle("CampeSENA");
  const albumId = albumRow?.id || null;

  const { album, songs, loading, error } = useAlbumFull(albumId);

  const cover = useMediaUrl(album?.cover_image_path);

  const audioPaths = useMemo(() => songs.map((s) => s.audio_path).filter(Boolean), [songs]);
  const { urls: audioUrls } = useMediaUrls(audioPaths);

  const [activeSongId, setActiveSongId] = useState(null);
  const [activeUrl, setActiveUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCreditsFor, setShowCreditsFor] = useState(null);
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [albumSaved, setAlbumSaved] = useState(false);
  const [albumSaving, setAlbumSaving] = useState(false);

  useEffect(() => {
    if (!activeSongId) return;
    const song = songs.find((s) => s.id === activeSongId);
    const url = song?.audio_path ? audioUrls?.[song.audio_path] : null;
    setActiveUrl(url || null);
  }, [activeSongId, songs, audioUrls]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setFavoritesLoading(true);
      try {
        const { data: sess } = await supabase.auth.getSession();
        const token = sess?.session?.access_token;
        if (!token) return false;

        const res = await fetch("/api/favorites/songs", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok) return true;

        if (!cancelled) {
          const ids = Array.isArray(json?.song_ids) ? json.song_ids : [];
          setFavoriteIds(new Set(ids));
        }
        return true;
      } finally {
        if (!cancelled) setFavoritesLoading(false);
      }
    };

    (async () => {
      const ok = await load();
      if (ok || cancelled) return;

      const { data: sub } = supabase.auth.onAuthStateChange(async (event) => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          await load();
        }
      });

      // Cleanup subscription if we created it
      return () => sub?.subscription?.unsubscribe();
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!albumId) return;
    let cancelled = false;

    const loadAlbumSaved = async () => {
      try {
        const { data: sess } = await supabase.auth.getSession();
        const token = sess?.session?.access_token;
        if (!token) return;

        const res = await fetch("/api/favorites/albums", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok) return;

        const ids = Array.isArray(json?.album_ids) ? json.album_ids : [];
        if (!cancelled) setAlbumSaved(ids.includes(albumId));
      } catch (_) {
        // ignore
      }
    };

    loadAlbumSaved();
    return () => {
      cancelled = true;
    };
  }, [albumId]);

  const activeSong = useMemo(() => songs.find((s) => s.id === activeSongId) || null, [songs, activeSongId]);

  const creditsSong = useMemo(() => songs.find((s) => s.id === showCreditsFor) || null, [songs, showCreditsFor]);

  const filteredSongs = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return songs;
    return songs.filter((s) => {
      const t = String(s?.title || "").toLowerCase();
      const a = String(s?.artist || "").toLowerCase();
      return t.includes(q) || a.includes(q);
    });
  }, [songs, query]);

  const playlist = useMemo(() => {
    if (!query) return songs;
    return filteredSongs;
  }, [songs, filteredSongs, query]);

  const activeIndex = useMemo(() => playlist.findIndex((s) => s.id === activeSongId), [playlist, activeSongId]);

  const playSongAt = (idx) => {
    if (idx < 0 || idx >= playlist.length) return;
    const s = playlist[idx];
    if (!s) return;
    setActiveSongId(s.id);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!activeSongId) return;
    const el = document.getElementById(`song-${activeSongId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeSongId]);

  useEffect(() => {
    const shouldIgnore = () => {
      if (showCreditsFor) return true;
      const a = document.activeElement;
      if (!a) return false;
      const tag = String(a.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return true;
      if (a.isContentEditable) return true;
      return false;
    };

    const onKeyDown = (e) => {
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (shouldIgnore()) return;

      const k = String(e.key || "");

      if (k === " " || k === "Spacebar") {
        e.preventDefault();
        const el = document.querySelector("audio");
        if (!el) return;
        if (el.paused) el.play();
        else el.pause();
        return;
      }

      if (k === "j" || k === "J") {
        e.preventDefault();
        if (activeIndex === -1) return;
        playSongAt(Math.max(0, activeIndex - 1));
        return;
      }

      if (k === "k" || k === "K") {
        e.preventDefault();
        if (activeIndex === -1) return;
        playSongAt(Math.min(playlist.length - 1, activeIndex + 1));
        return;
      }

      if (k === "ArrowLeft") {
        const el = document.querySelector("audio");
        if (!el || !Number.isFinite(el.currentTime)) return;
        e.preventDefault();
        el.currentTime = Math.max(0, (el.currentTime || 0) - 5);
        return;
      }

      if (k === "ArrowRight") {
        const el = document.querySelector("audio");
        if (!el || !Number.isFinite(el.currentTime)) return;
        e.preventDefault();
        const d = Number.isFinite(el.duration) ? el.duration : Infinity;
        el.currentTime = Math.min(d, (el.currentTime || 0) + 5);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, playlist, showCreditsFor]);

  const bg = {
    base: "#121212",
    azul: "#002D62",
    turq: "#00B8A9",
    verde: "#009F4D",
    amarillo: "#FFD166",
    naranja: "#F8BA3F",
    steel: "#215585",
    rojo: "#C92B28",
  };

  const pageLoading = findingAlbum || loading;
  const pageError = findErr || error;

  return (
    <div style={{ background: bg.base, color: "#fff", minHeight: "100vh" }}>
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-10 pb-16">
        <AlbumHero
          coverUrl={cover.url}
          loadingCover={pageLoading}
          title={album?.title || (pageLoading ? "Cargando..." : "Álbum CampeSENA")}
          description={album?.description || "Una experiencia sonora cultural con estética moderna."}
          subtitle="Sonidos que conectan el campo con el país"
          tracksCount={filteredSongs.length}
          canPlay={!!filteredSongs.length}
          saved={albumSaved}
          onSave={async () => {
            if (!albumId || albumSaving) return;
            const next = !albumSaved;
            const prev = albumSaved;
            setAlbumSaved(next);
            setAlbumSaving(true);
            try {
              const { data: sess } = await supabase.auth.getSession();
              const token = sess?.session?.access_token;
              if (!token) throw new Error("No session");

              const res = await fetch("/api/favorites/albums", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ album_id: albumId, favorite: next }),
              });

              if (!res.ok) {
                setAlbumSaved(prev);
              }
            } catch (_) {
              setAlbumSaved(prev);
            } finally {
              setAlbumSaving(false);
            }
          }}
          onPlayAll={() => {
            if (!filteredSongs.length) return;
            const first = filteredSongs[0];
            setActiveSongId(first.id);
            setIsPlaying(true);
          }}
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold tracking-tight">Lista de canciones</h2>
              <div className="text-xs text-white/50">Haz click en Play</div>
            </div>

            <div className="mt-4">
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por canción o artista..."
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-extrabold text-white/60 hover:text-white"
                  >
                    Limpiar
                  </button>
                ) : null}
              </div>
              {!pageLoading && !pageError && songs.length > 0 ? (
                <div className="mt-2 text-xs text-white/50">
                  Mostrando {filteredSongs.length} de {songs.length}
                </div>
              ) : null}
            </div>

            {pageLoading && <div className="mt-4 text-white/70 text-sm">Cargando álbum...</div>}
            {pageError && (
              <div className="mt-4 text-sm" style={{ color: bg.amarillo }}>
                {String(pageError?.message || pageError)}
              </div>
            )}

            {!pageLoading && !pageError && songs.length === 0 && (
              <div className="mt-4 text-white/70 text-sm">Este álbum no tiene canciones todavía.</div>
            )}

            {!pageLoading && !pageError && songs.length > 0 && filteredSongs.length === 0 && (
              <div className="mt-4 text-white/70 text-sm">No hay resultados para tu búsqueda.</div>
            )}

            <div className="mt-4 space-y-3">
              {filteredSongs.map((song, idx) => {
                const isActive = song.id === activeSongId;
                const url = song.audio_path ? audioUrls?.[song.audio_path] : null;
                const isFav = favoriteIds.has(song.id);

                return (
                  <div key={song.id} id={`song-${song.id}`}>
                    <SongCard
                      song={song}
                      index={idx}
                      isActive={isActive}
                      isPlaying={isPlaying}
                      canPlay={!!url}
                      isFav={isFav}
                      favoritesLoading={favoritesLoading}
                      creditsOpen={showCreditsFor === song.id}
                      onPlay={() => {
                        setActiveSongId(song.id);
                        setIsPlaying(true);
                      }}
                      onToggleCredits={() => setShowCreditsFor((v) => (v === song.id ? null : song.id))}
                      onToggleFav={async () => {
                        const next = !favoriteIds.has(song.id);
                        const prevSet = favoriteIds;

                        const updated = new Set(prevSet);
                        if (next) updated.add(song.id);
                        else updated.delete(song.id);
                        setFavoriteIds(updated);

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
                            body: JSON.stringify({ song_id: song.id, favorite: next }),
                          });

                          if (!res.ok) {
                            setFavoriteIds(prevSet);
                          }
                        } catch (e) {
                          setFavoriteIds(prevSet);
                        }
                      }}
                    />
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
                      src={activeUrl}
                      controls
                      autoPlay={isPlaying}
                      className="w-full"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => setIsPlaying(false)}
                    />
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/70">
                      {pageLoading ? "Cargando..." : "Elige una canción para reproducir"}
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="text-xs text-white/60 font-black">Estado</div>
                    <div className="mt-1 text-sm font-extrabold" style={{ color: isPlaying ? bg.turq : "rgba(255,255,255,0.70)" }}>
                      {isPlaying ? "Reproduciendo" : "Pausado"}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="text-xs text-white/60 font-black">Créditos</div>
                    <div className="mt-1 text-sm font-extrabold" style={{ color: bg.amarillo }}>
                      {activeSong?.credits ? "Disponibles" : "—"}
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      if (!activeSongId) return;
                      setShowCreditsFor(activeSongId);
                    }}
                    className="w-full rounded-2xl px-4 py-3 text-sm font-extrabold border border-white/10 hover:border-white/20 transition"
                    style={{ background: "rgba(0,0,0,0.30)", color: "#fff" }}
                    disabled={!activeSongId}
                  >
                    Ver créditos de la canción activa
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <CreditsModal
        open={!!showCreditsFor}
        song={creditsSong}
        onClose={() => setShowCreditsFor(null)}
      >
        <CreditsPanel credits={creditsSong?.credits} />
      </CreditsModal>

      <NowPlaying
        open={nowPlayingOpen}
        coverUrl={cover.url}
        song={activeSong}
        activeUrl={activeUrl}
        isPlaying={isPlaying}
        isFav={!!activeSongId && favoriteIds.has(activeSongId)}
        favoritesLoading={favoritesLoading}
        onToggleFav={async () => {
          if (!activeSongId) return;
          const next = !favoriteIds.has(activeSongId);
          const prevSet = favoriteIds;

          const updated = new Set(prevSet);
          if (next) updated.add(activeSongId);
          else updated.delete(activeSongId);
          setFavoriteIds(updated);

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
              body: JSON.stringify({ song_id: activeSongId, favorite: next }),
            });

            if (!res.ok) {
              setFavoriteIds(prevSet);
            }
          } catch (e) {
            setFavoriteIds(prevSet);
          }
        }}
        onClose={() => setNowPlayingOpen(false)}
        onOpenCredits={() => {
          if (!activeSongId) return;
          setShowCreditsFor(activeSongId);
        }}
        onPlay={() => {
          const el = document.querySelector("audio");
          if (el && typeof el.play === "function") el.play();
          setIsPlaying(true);
        }}
        onPause={() => {
          const el = document.querySelector("audio");
          if (el && typeof el.pause === "function") el.pause();
          setIsPlaying(false);
        }}
        onNext={() => {
          if (activeIndex === -1) return;
          playSongAt(Math.min(playlist.length - 1, activeIndex + 1));
        }}
        onPrev={() => {
          if (activeIndex === -1) return;
          playSongAt(Math.max(0, activeIndex - 1));
        }}
      />

      <MiniPlayer
        activeSong={activeSong}
        activeUrl={activeUrl}
        isPlaying={isPlaying}
        onOpenNowPlaying={() => setNowPlayingOpen(true)}
        onPlay={() => {
          const el = document.querySelector("audio");
          if (el && typeof el.play === "function") el.play();
          setIsPlaying(true);
        }}
        onPause={() => {
          const el = document.querySelector("audio");
          if (el && typeof el.pause === "function") el.pause();
          setIsPlaying(false);
        }}
        onNext={() => {
          if (activeIndex === -1) return;
          playSongAt(Math.min(playlist.length - 1, activeIndex + 1));
        }}
        onPrev={() => {
          if (activeIndex === -1) return;
          playSongAt(Math.max(0, activeIndex - 1));
        }}
      />
    </div>
  );
}

function CreditsBlock({ credits }) {
  if (!credits) return <div className="text-white/70">(Sin créditos)</div>;

  const rows = [
    { label: "Composición / Letra", value: credits.composition_lyrics },
    { label: "Producción / Ingeniería", value: credits.production_engineering },
    { label: "Productor", value: credits.producer },
    { label: "Masterización", value: credits.mastering_engineer },
    { label: "Intérpretes", value: credits.performers },
    { label: "Fuentes", value: credits.sources },
  ].filter((r) => r.value);

  if (!rows.length) return <div className="text-white/70">(Sin créditos)</div>;

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.label} className="grid gap-1">
          <div className="text-xs font-black tracking-wide text-white/60">{r.label}</div>
          <div className="text-sm text-white/85 whitespace-pre-wrap">{r.value}</div>
        </div>
      ))}
    </div>
  );
}
