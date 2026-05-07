"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import PrivatePageHeader from "../../components/PrivatePageHeader";
import { supabase } from "../../../lib/supabaseClient";

const REGIONS = ["Amazonía", "Andina", "Caribe", "Insular", "Pacífico", "Orinoquia"];

const REGION_THEME = {
  "Amazonía": {
    a: "#14532D",
    b: "#16A34A",
    ring: "rgba(22,163,74,0.35)",
  },
  Andina: {
    a: "#1D4ED8",
    b: "#38BDF8",
    ring: "rgba(29,78,216,0.30)",
  },
  Caribe: {
    a: "#C2410C",
    b: "#F59E0B",
    ring: "rgba(245,158,11,0.35)",
  },
  Insular: {
    a: "#0F766E",
    b: "#22C55E",
    ring: "rgba(15,118,110,0.28)",
  },
  "Pacífico": {
    a: "#7C2D12",
    b: "#FB7185",
    ring: "rgba(251,113,133,0.28)",
  },
  Orinoquia: {
    a: "#6D28D9",
    b: "#A78BFA",
    ring: "rgba(109,40,217,0.26)",
  },
};

function themeFor(region) {
  return REGION_THEME[region] || { a: "#002D62", b: "#00B8A9", ring: "rgba(0,45,98,0.18)" };
}

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

function IconFilter({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16M6 12h12M10 19h4" />
    </svg>
  );
}

function formatDuration(sec) {
  if (!Number.isFinite(sec) || sec <= 0) return "-";
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export const dynamic = "force-dynamic";

export default function SonidosMapaPage() {
  const audioRef = useRef(null);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedRegions, setSelectedRegions] = useState(() => new Set());
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [sortBy, setSortBy] = useState("recent");

  const [playingId, setPlayingId] = useState(null);
  const [durationById, setDurationById] = useState(() => new Map());

  const filtered = useMemo(() => {
    const q = String(search || "").trim().toLowerCase();
    const selected = selectedRegions;

    let arr = (items || []).filter(Boolean);
    if (onlyFeatured) arr = arr.filter((it) => !!it.es_destacado);
    if (selected && selected.size) arr = arr.filter((it) => selected.has(it.region));
    if (q) {
      arr = arr.filter((it) => {
        const t = String(it.titulo || "").toLowerCase();
        const r = String(it.region || "").toLowerCase();
        return t.includes(q) || r.includes(q);
      });
    }

    if (sortBy === "az") {
      arr = arr.slice().sort((a, b) => String(a?.titulo || "").localeCompare(String(b?.titulo || "")));
    } else {
      arr = arr.slice().sort((a, b) => {
        const ad = new Date(a?.created_at || 0).getTime();
        const bd = new Date(b?.created_at || 0).getTime();
        return bd - ad;
      });
    }

    return arr;
  }, [items, onlyFeatured, search, selectedRegions, sortBy]);

  const totalCount = filtered.length;

  const current = useMemo(() => {
    if (!playingId) return null;
    for (const it of items || []) if (String(it.id) === String(playingId)) return it;
    return null;
  }, [items, playingId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data, error: qErr } = await supabase
          .from("mapa_sonoro")
          .select("id,titulo,region,audio_url,es_destacado,created_at")
          .order("created_at", { ascending: false });

        if (qErr) throw qErr;
        if (mounted) setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setError(e?.message || "No se pudo cargar el Mapa Sonoro");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const isPlaying = (it) => it && String(playingId) === String(it.id);

  const toggleRegion = (region) => {
    setSelectedRegions((prev) => {
      const next = new Set(prev);
      if (next.has(region)) next.delete(region);
      else next.add(region);
      return next;
    });
  };

  const clearRegions = () => setSelectedRegions(new Set());

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onEnded = () => setPlayingId(null);
    const onPause = () => {
      if (!el.ended) setPlayingId(null);
    };

    el.addEventListener("ended", onEnded);
    el.addEventListener("pause", onPause);

    return () => {
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("pause", onPause);
    };
  }, []);

  const playItem = async (it) => {
    const el = audioRef.current;
    if (!el || !it?.audio_url) return;

    const same = String(playingId) === String(it.id);
    if (same) {
      try {
        el.pause();
      } catch {}
      setPlayingId(null);
      return;
    }

    setPlayingId(it.id);

    try {
      if (el.src !== it.audio_url) {
        el.src = it.audio_url;
      }
      el.currentTime = 0;
      const p = el.play();
      if (p && typeof p.catch === "function") await p.catch(() => {});
    } catch {
      setPlayingId(null);
    }
  };

  return (
    <main>
      <PrivatePageHeader
        title="Archivo de la Memoria"
        subtitle="Una colección curada de paisajes sonoros, ritmos tradicionales y testimonios orales que definen nuestra identidad cultural."
      />

      <section
        className={cx(
          "bg-grisClaro",
          "pt-8",
          "bg-[radial-gradient(1200px_600px_at_20%_0%,rgba(0,184,169,0.10),transparent_55%),radial-gradient(900px_520px_at_90%_15%,rgba(0,45,98,0.08),transparent_60%)]",
          playingId ? "pb-28" : "pb-16"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-start justify-between gap-4 flex-col lg:flex-row">
            <aside className="w-full lg:w-[320px] shrink-0">
              <div
                className="lg:sticky lg:top-6 rounded-3xl bg-white/90 backdrop-blur ring-1 ring-black/5 p-5"
                style={{ boxShadow: "0 18px 60px rgba(0,0,0,0.08)" }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-azulInstitucional">
                    <IconFilter className="h-4 w-4" />
                    Filtros
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      clearRegions();
                      setOnlyFeatured(false);
                      setSearch("");
                      setSortBy("recent");
                    }}
                    className="text-xs font-extrabold text-gray-600 hover:text-azulInstitucional transition"
                  >
                    Limpiar
                  </button>
                </div>

                <div className="mt-5">
                  <div className="text-[11px] font-black tracking-widest text-gray-500">REGIÓN</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {REGIONS.map((r) => {
                      const active = selectedRegions.has(r);
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => toggleRegion(r)}
                          className={cx(
                            "px-3 py-1.5 rounded-full text-xs font-extrabold ring-1 transition",
                            active
                              ? "bg-azulInstitucional text-white ring-azulInstitucional/20"
                              : "bg-gray-50 text-gray-700 ring-black/5 hover:bg-azulInstitucional/5"
                          )}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5">
                  <div className="text-[11px] font-black tracking-widest text-gray-500">BÚSQUEDA</div>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por título o región..."
                    className="mt-2 w-full rounded-2xl bg-grisClaro px-4 py-3 text-sm outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-turquesaAudioBrand"
                  />
                </div>

                <div className="mt-5">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={onlyFeatured}
                      onChange={(e) => setOnlyFeatured(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm font-bold text-gray-700">Solo destacados</span>
                  </label>
                </div>

                <div className="mt-5">
                  <div className="text-[11px] font-black tracking-widest text-gray-500">ORDENAR POR</div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-turquesaAudioBrand"
                  >
                    <option value="recent">Recientes</option>
                    <option value="az">A - Z</option>
                  </select>
                </div>

                <div className="mt-6">
                  <Link
                    href="/app/mapa"
                    className="w-full inline-flex items-center justify-center px-4 py-3 rounded-full bg-azulInstitucional text-white text-sm font-extrabold hover:brightness-110 transition"
                  >
                    Ver en mapa
                  </Link>
                </div>
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="text-sm text-gray-700">
                  <span className="font-extrabold text-azulInstitucional">{totalCount}</span> sonidos encontrados
                </div>
              </div>

              {loading ? <div className="mt-6 text-sm text-gray-700">Cargando...</div> : null}
              {!loading && error ? <div className="mt-6 text-sm text-red-600">{error}</div> : null}

              {!loading && !error ? (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 justify-items-center sm:justify-items-stretch">
                  {filtered.map((it) => {
                    const active = isPlaying(it);
                    const dur = durationById.get(String(it.id));
                    const featured = !!it.es_destacado;
                    const th = themeFor(it.region);
                    const headerBg = `linear-gradient(135deg, ${th.a} 0%, ${th.b} 100%)`;
                    const borderColor = featured ? "rgba(254,206,67,0.85)" : th.ring;

                    return (
                      <div
                        key={it.id}
                        className={cx(
                          "w-full max-w-[360px] sm:max-w-none group overflow-hidden rounded-[28px] bg-white transition-transform duration-200 hover:-translate-y-1",
                          featured ? "border-2" : "border"
                        )}
                        style={{
                          boxShadow: featured ? "0 22px 70px rgba(254,206,67,0.18)" : "0 18px 60px rgba(0,0,0,0.08)",
                          borderColor,
                        }}
                      >
                        <div
                          className="relative h-[172px]"
                          style={{ background: headerBg }}
                        >
                          <div className="absolute inset-0 opacity-45" style={{ background: "radial-gradient(65% 55% at 18% 18%, rgba(255,255,255,0.42), transparent 55%)" }} />
                          <div
                            className="absolute inset-0 opacity-30"
                            style={{
                              background:
                                "repeating-linear-gradient(90deg, rgba(255,255,255,0.34) 0px, rgba(255,255,255,0.34) 2px, transparent 2px, transparent 9px)",
                              maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)",
                            }}
                          />

                          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-[11px] font-black tracking-widest ring-1 ring-black/5" style={{ color: th.a }}>
                            {it.region}
                          </div>

                          {featured ? (
                            <div
                              className="absolute -right-10 top-7 rotate-45 text-white text-[11px] font-black tracking-widest px-14 py-2 shadow-sm"
                              style={{ background: th.a, boxShadow: "0 18px 60px rgba(0,0,0,0.18)" }}
                            >
                              DESTACADO
                            </div>
                          ) : (
                            <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-[11px] font-black tracking-widest ring-1 ring-black/5" style={{ color: th.a }}>
                              MAPA SONORO
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => playItem(it)}
                            disabled={!it.audio_url}
                            className={cx(
                              "absolute left-4 bottom-4 inline-flex items-center justify-center h-11 w-11 rounded-full shadow-sm ring-1 transition",
                              active
                                ? "bg-amarilloVibrante text-gray-900 ring-black/5"
                                : featured
                                  ? "text-white hover:brightness-110"
                                  : "text-white hover:brightness-110",
                              !it.audio_url ? "opacity-60 cursor-not-allowed" : ""
                            )}
                            style={
                              active
                                ? undefined
                                : {
                                    background: featured ? th.a : th.b,
                                    borderColor: featured ? th.a : th.b,
                                  }
                            }
                            title={active ? "Pausar" : "Reproducir"}
                          >
                            {active ? <IconPause className="h-5 w-5" /> : <IconPlay className="h-5 w-5" />}
                          </button>
                        </div>

                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-extrabold text-azulInstitucional leading-snug line-clamp-2">{it.titulo}</div>
                              <div className="mt-1 text-xs text-gray-600 truncate">
                                {it.region}
                                {featured ? " · Destacado" : ""}
                              </div>
                            </div>
                            <div className="text-xs font-bold text-gray-500">{formatDuration(dur)}</div>
                          </div>

                          <div className="mt-4">
                            <button
                              type="button"
                              onClick={() => playItem(it)}
                              disabled={!it.audio_url}
                              className={cx(
                                "w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-extrabold transition",
                                active
                                  ? "bg-amarilloVibrante text-gray-900 hover:brightness-105"
                                  : "bg-azulInstitucional text-white hover:brightness-110",
                                !it.audio_url ? "opacity-60 cursor-not-allowed" : ""
                              )}
                            >
                              {active ? <IconPause className="h-5 w-5" /> : <IconPlay className="h-5 w-5" />}
                              {active ? "Pausar" : "Reproducir"}
                            </button>
                          </div>
                        </div>

                        {it.audio_url ? (
                          <audio
                            src={it.audio_url}
                            preload="metadata"
                            onLoadedMetadata={(e) => {
                              const d = e?.currentTarget?.duration;
                              if (!Number.isFinite(d)) return;
                              setDurationById((prev) => {
                                const next = new Map(prev);
                                next.set(String(it.id), d);
                                return next;
                              });
                            }}
                            className="hidden"
                          />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>

          <audio ref={audioRef} className="hidden" />

          {current ? (
            <div className="fixed left-0 right-0 bottom-0 z-[70] lg:left-72">
              <div className="mx-auto max-w-6xl px-4 pb-4">
                <div
                  className="rounded-[28px] border border-white/45 bg-white/90 backdrop-blur p-4 ring-1 ring-black/10"
                  style={{ boxShadow: "0 18px 60px rgba(0,0,0,0.18)" }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-[11px] font-black tracking-widest text-gray-500">REPRODUCIENDO</div>
                      <div className="mt-1 text-sm font-extrabold text-azulInstitucional truncate">{current.titulo}</div>
                      <div className="mt-0.5 text-xs text-gray-600 truncate">{current.region}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => playItem(current)}
                      className="shrink-0 inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-azulInstitucional text-white hover:brightness-110 transition"
                      title="Pausar"
                    >
                      <IconPause className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
