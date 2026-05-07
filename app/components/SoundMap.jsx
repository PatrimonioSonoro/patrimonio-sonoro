"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const REGIONS = ["Amazonía", "Andina", "Caribe", "Insular", "Pacífico", "Orinoquia"];

const REGION_THEME = {
  "Amazonía": { a: "#14532D", b: "#16A34A" },
  Andina: { a: "#1D4ED8", b: "#38BDF8" },
  Caribe: { a: "#C2410C", b: "#F59E0B" },
  Insular: { a: "#0F766E", b: "#22C55E" },
  "Pacífico": { a: "#7C2D12", b: "#FB7185" },
  Orinoquia: { a: "#6D28D9", b: "#A78BFA" },
};

function themeFor(region) {
  return REGION_THEME[region] || { a: "#002D62", b: "#00B8A9" };
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

export default function SoundMap() {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markersLayerRef = useRef(null);

  const audioRef = useRef(null);
  const pendingAutoPlayRef = useRef(false);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeRegion, setActiveRegion] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [durationSec, setDurationSec] = useState(null);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    return (items || []).filter((it) => {
      if (activeRegion && it.region !== activeRegion) return false;
      if (!q) return true;
      return String(it.titulo || "").toLowerCase().includes(q) || String(it.region || "").toLowerCase().includes(q);
    });
  }, [items, activeRegion, query]);

  const counts = useMemo(() => {
    const c = new Map();
    for (const r of REGIONS) c.set(r, 0);
    for (const it of items || []) {
      const r = it.region;
      if (!r) continue;
      c.set(r, (c.get(r) || 0) + 1);
    }
    return c;
  }, [items]);

  const totalCount = useMemo(() => {
    let n = 0;
    for (const v of counts.values()) n += v;
    return n;
  }, [counts]);

  useEffect(() => {
    // Helper to inject a stylesheet once
    const ensureLeafletStyles = () => {
      const existing = document.querySelector(
        'link[href*="unpkg.com/leaflet@1.9.4/dist/leaflet.css"]'
      );
      if (!existing) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
    };

    // Helper to load Leaflet script once
    const loadLeafletScript = () =>
      new Promise((resolve, reject) => {
        if (typeof window !== "undefined" && window.L) return resolve(window.L);
        const existing = document.querySelector(
          'script[src*="unpkg.com/leaflet@1.9.4/dist/leaflet.js"]'
        );
        if (existing) {
          existing.addEventListener("load", () => resolve(window.L));
          existing.addEventListener("error", reject);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        script.onload = () => resolve(window.L);
        script.onerror = reject;
        document.body.appendChild(script);
      });

    const initMap = async () => {
      ensureLeafletStyles();
      const L = await loadLeafletScript();
      if (!containerRef.current || !L) return;

      // Initialize map
      const map = L.map(containerRef.current, { zoomControl: true }).setView(
        [4.5709, -74.2973],
        5
      );
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenTopoMap contributors",
        maxZoom: 18,
      }).addTo(map);

      try {
        map.zoomControl.setPosition("bottomright");
      } catch {}

      const layer = L.layerGroup();
      layer.addTo(map);
      markersLayerRef.current = layer;
    };

    initMap();

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {}
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data, error: qErr } = await supabase
          .from("mapa_sonoro")
          .select("id,titulo,region,audio_url,lat,lng,es_destacado,created_at")
          .order("created_at", { ascending: false });

        if (qErr) throw qErr;

        const normalized = (data || []).filter(Boolean).sort((a, b) => {
          const ar = String(a?.region || "");
          const br = String(b?.region || "");
          return ar.localeCompare(br);
        });

        if (mounted) {
          setItems(normalized);
          if (!selected && normalized[0]) setSelected(normalized[0]);
        }
      } catch (e) {
        if (mounted) setError(e?.message || "No se pudo cargar el mapa sonoro");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = markersLayerRef.current;
    const L = typeof window !== "undefined" ? window.L : null;
    if (!map || !layer || !L) return;

    try {
      layer.clearLayers();
    } catch {}

    const icon = L.divIcon({
      className: "sm-marker",
      html: '<div class="sm-marker-inner" aria-hidden="true"></div>',
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    for (const it of filtered) {
      const lat = Number(it.lat);
      const lng = Number(it.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

      const safeTitle = String(it.titulo || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const safeRegion = String(it.region || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      const popupHtml = `
        <div class="sm-popup-card">
          <div class="sm-popup-region">${safeRegion.toUpperCase()}</div>
          <div class="sm-popup-title">${safeTitle}</div>
          <button class="sm-popup-play" type="button">Reproducir Ahora</button>
        </div>
      `;

      const marker = L.marker([lat, lng], { icon });
      marker.bindPopup(popupHtml, {
        closeButton: false,
        autoClose: true,
        closeOnClick: false,
        className: "sm-popup",
        offset: [0, -10],
        autoPan: false,
      });

      let closeTimer = null;
      let hoveringPopup = false;

      marker.on("mouseover", () => {
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
        try {
          marker.openPopup();
        } catch {}
      });
      marker.on("mouseout", () => {
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
        closeTimer = setTimeout(() => {
          if (hoveringPopup) return;
          try {
            marker.closePopup();
          } catch {}
        }, 350);
      });
      marker.on("click", () => setSelected(it));

      marker.on("popupopen", (e) => {
        const el = e?.popup?.getElement?.();
        if (el) {
          const card = el.querySelector?.(".sm-popup-card");
          if (card) {
            const onEnter = () => {
              hoveringPopup = true;
              if (closeTimer) {
                clearTimeout(closeTimer);
                closeTimer = null;
              }
            };
            const onLeave = () => {
              hoveringPopup = false;
              if (closeTimer) {
                clearTimeout(closeTimer);
                closeTimer = null;
              }
              closeTimer = setTimeout(() => {
                try {
                  marker.closePopup();
                } catch {}
              }, 120);
            };
            card.addEventListener("mouseenter", onEnter);
            card.addEventListener("mouseleave", onLeave);
            e.popup.once("remove", () => {
              try {
                card.removeEventListener("mouseenter", onEnter);
                card.removeEventListener("mouseleave", onLeave);
              } catch {}
            });
          }
        }
        const btn = el?.querySelector?.(".sm-popup-play");
        if (!btn) return;
        const onClick = (evt) => {
          try {
            evt?.preventDefault?.();
            evt?.stopPropagation?.();
          } catch {}
          pendingAutoPlayRef.current = true;
          setSelected(it);
        };
        btn.addEventListener("click", onClick);
        e.popup.once("remove", () => {
          try {
            btn.removeEventListener("click", onClick);
          } catch {}
        });
      });

      marker.addTo(layer);
    }
  }, [filtered]);

  useEffect(() => {
    const map = mapRef.current;
    const L = typeof window !== "undefined" ? window.L : null;
    if (!map || !L || !selected) return;
    const lat = Number(selected.lat);
    const lng = Number(selected.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    try {
      map.flyTo([lat, lng], Math.max(6, map.getZoom()), { duration: 0.75 });
    } catch {}
  }, [selected]);

  useEffect(() => {
    setDurationSec(null);
    setIsPlaying(false);
    setCurrentTimeSec(0);
    const el = audioRef.current;
    if (!el) return;
    try {
      el.pause();
      el.currentTime = 0;
    } catch {}

    if (pendingAutoPlayRef.current) {
      pendingAutoPlayRef.current = false;
      const a = audioRef.current;
      if (!a) return;

      let done = false;
      const attemptPlay = async () => {
        if (done) return;
        try {
          const p = a.play();
          if (p && typeof p.catch === "function") await p.catch(() => {});
          setIsPlaying(true);
          done = true;
          cleanup();
        } catch {
          // If the media isn't ready yet, we'll retry on canplay.
        }
      };

      const onCanPlay = () => {
        attemptPlay();
      };

      const cleanup = () => {
        try {
          a.removeEventListener("canplay", onCanPlay);
          a.removeEventListener("loadeddata", onCanPlay);
          a.removeEventListener("loadedmetadata", onCanPlay);
        } catch {}
      };

      a.addEventListener("canplay", onCanPlay);
      a.addEventListener("loadeddata", onCanPlay);
      a.addEventListener("loadedmetadata", onCanPlay);

      // Try immediately in case the audio is already buffered.
      attemptPlay();

      return cleanup;
    }
  }, [selected?.id]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    let raf = 0;
    const tick = () => {
      if (!isSeeking) {
        const t = el.currentTime;
        if (Number.isFinite(t)) setCurrentTimeSec(t);
      }
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => {
      try {
        if (raf) window.cancelAnimationFrame(raf);
      } catch {}
    };
  }, [isSeeking, selected?.id]);

  const onTogglePlay = async () => {
    const el = audioRef.current;
    if (!el) return;

    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
      return;
    }

    try {
      const p = el.play();
      if (p && typeof p.catch === "function") await p.catch(() => {});
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const formatDuration = (sec) => {
    if (!Number.isFinite(sec) || sec <= 0) return "-";
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const progressPct = useMemo(() => {
    const d = Number(durationSec);
    const t = Number(currentTimeSec);
    if (!Number.isFinite(d) || d <= 0) return 0;
    if (!Number.isFinite(t) || t <= 0) return 0;
    return clamp((t / d) * 100, 0, 100);
  }, [currentTimeSec, durationSec]);

  const seekTo = (sec) => {
    const el = audioRef.current;
    const d = Number(durationSec);
    if (!el) return;
    if (!Number.isFinite(d) || d <= 0) return;
    const next = clamp(Number(sec) || 0, 0, d);
    try {
      el.currentTime = next;
    } catch {}
    setCurrentTimeSec(next);
  };

  const skipBy = (delta) => {
    const el = audioRef.current;
    if (!el) return;
    const d = Number(durationSec);
    if (!Number.isFinite(d) || d <= 0) return;
    const next = clamp((Number(el.currentTime) || 0) + delta, 0, d);
    try {
      el.currentTime = next;
    } catch {}
    setCurrentTimeSec(next);
  };

  const selectedTheme = useMemo(() => themeFor(selected?.region), [selected?.region]);

  return (
    <div id="mapa-sonoro" className="relative">
      <div className="relative rounded-[28px] overflow-hidden ring-1 ring-black/5 bg-white">
        <div ref={containerRef} className="w-full h-[520px] sm:h-[640px] lg:h-[78vh] min-h-[560px]" aria-label="Mapa Sonoro de Colombia" />

        <div className="hidden lg:block absolute right-4 top-4 z-[5] w-[320px] max-w-[calc(100%-2rem)]">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar sonidos..."
              className="w-full rounded-full bg-white/85 backdrop-blur-xl px-11 py-3 text-sm outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-turquesaAudioBrand shadow-[0_18px_60px_rgba(0,0,0,0.14)]"
            />
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M21 21l-4.2-4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        <div className="sm-panel-scroll hidden lg:block absolute left-4 top-4 z-[5] w-[292px] sm:w-[320px] max-h-[calc(100%-2rem)] overflow-auto pr-1 pb-[150px]">
          <aside className="relative rounded-2xl border border-white/55 bg-white/75 backdrop-blur-xl p-4 shadow-[0_18px_60px_rgba(0,0,0,0.14)] overflow-hidden">
            <div className="pointer-events-none absolute inset-0 opacity-80">
              <div className="absolute -top-12 -right-16 h-56 w-56 rounded-full blur-3xl" style={{ background: "rgba(0,184,169,0.18)" }} />
              <div className="absolute -bottom-16 -left-20 h-64 w-64 rounded-full blur-3xl" style={{ background: "rgba(0,45,98,0.14)" }} />
            </div>

            <div className="relative flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold text-azulInstitucional leading-tight">Regiones de Colombia</div>
                <div className="mt-0.5 text-[11px] text-gray-600">Elige una región para escuchar su destacado</div>
              </div>
            </div>

            <div className="relative mt-3 space-y-2">
              <button
                type="button"
                onClick={() => setActiveRegion("")}
                className={cx(
                  "w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm ring-1 transition duration-200",
                  !activeRegion
                    ? "bg-azulInstitucional text-white ring-azulInstitucional/20"
                    : "bg-white/70 ring-black/5 text-gray-800 hover:bg-azulInstitucional/5"
                )}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className={cx("h-2.5 w-2.5 rounded-full ring-2 ring-white/80", !activeRegion ? "bg-white/90" : "bg-azulInstitucional")} />
                  <span className={cx("font-semibold truncate", !activeRegion ? "text-white" : "text-gray-900")}>Todas las Regiones</span>
                </span>
                <span className={cx("text-[11px]", !activeRegion ? "text-white/80" : "text-gray-500")}>{totalCount} sonidos</span>
              </button>

              {REGIONS.map((r) => {
                const active = r === activeRegion;
                const th = themeFor(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setActiveRegion(r)}
                    className={cx(
                      "w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm ring-1 transition duration-200",
                      active
                        ? "bg-turquesaAudioBrand text-white ring-turquesaAudioBrand/30"
                        : "bg-white/70 ring-black/5 text-gray-800 hover:bg-turquesaAudioBrand/5"
                    )}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span
                        className={cx("h-2.5 w-2.5 rounded-full ring-2", active ? "ring-white/80" : "ring-white")}
                        style={{ background: active ? "rgba(255,255,255,0.92)" : th.a }}
                      />
                      <span className={cx("font-semibold truncate", active ? "text-white" : "text-gray-900")}>{r}</span>
                    </span>
                    <span className={cx("text-[11px]", active ? "text-white/85" : "text-gray-500")}>{counts.get(r) || 0} sonidos</span>
                  </button>
                );
              })}
            </div>

            {loading ? <div className="mt-3 text-xs text-gray-600">Cargando mapa...</div> : null}
            {!loading && error ? <div className="mt-3 text-xs text-red-600">{error}</div> : null}
            {!loading && !error && !items.length ? (
              <div className="mt-3 text-xs text-gray-600">Aún no hay audios destacados por región.</div>
            ) : null}
          </aside>
        </div>

        {selected ? (
          <div className="absolute left-4 bottom-4 z-[5] w-[340px] max-w-[calc(100%-2rem)]">
            <div className="rounded-2xl border border-white/55 bg-white/72 backdrop-blur-xl px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.14)] overflow-hidden">
              <div className="pointer-events-none absolute inset-0 opacity-70">
                <div className="absolute -top-10 -right-14 h-44 w-44 rounded-full blur-3xl" style={{ background: "rgba(0,184,169,0.16)" }} />
                <div className="absolute -bottom-14 -left-16 h-52 w-52 rounded-full blur-3xl" style={{ background: "rgba(0,45,98,0.14)" }} />
              </div>

              <div className="relative flex items-center gap-3">
                <button
                  type="button"
                  onClick={onTogglePlay}
                  className="shrink-0 inline-flex items-center justify-center h-11 w-11 rounded-full shadow-[0_14px_40px_rgba(0,0,0,0.18)]"
                  style={{ background: isPlaying ? selectedTheme.a : "#0B3A53", color: "#fff" }}
                  title={isPlaying ? "Pausar" : "Reproducir"}
                  disabled={!selected.audio_url}
                >
                  {isPlaying ? <IconPause className="h-5 w-5" /> : <IconPlay className="h-5 w-5" />}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-azulInstitucional truncate">{selected.titulo}</div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-gray-600 truncate">{selected.region}</div>
                    <div className="text-[11px] text-gray-600 tabular-nums">
                      {formatDuration(currentTimeSec)} / {formatDuration(durationSec)}
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="relative h-[8px] rounded-full bg-black/10 overflow-hidden">
                      <div className="absolute inset-y-0 left-0" style={{ width: `${progressPct}%`, background: selectedTheme.b }} />
                      <input
                        type="range"
                        min={0}
                        max={Number.isFinite(durationSec) && durationSec > 0 ? durationSec : 0}
                        step={0.1}
                        value={Number.isFinite(currentTimeSec) ? currentTimeSec : 0}
                        onMouseDown={() => setIsSeeking(true)}
                        onTouchStart={() => setIsSeeking(true)}
                        onMouseUp={(e) => {
                          setIsSeeking(false);
                          seekTo(e.target.value);
                        }}
                        onTouchEnd={(e) => {
                          setIsSeeking(false);
                          seekTo(e.target.value);
                        }}
                        onChange={(e) => {
                          setCurrentTimeSec(Number(e.target.value) || 0);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="Progreso de reproducción"
                      />
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => skipBy(-10)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/75 ring-1 ring-black/5 text-azulInstitucional hover:bg-white"
                        title="Retroceder 10 segundos"
                        disabled={!selected.audio_url || !Number.isFinite(durationSec) || durationSec <= 0}
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                          <path d="M11 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M20 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => skipBy(10)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/75 ring-1 ring-black/5 text-azulInstitucional hover:bg-white"
                        title="Adelantar 10 segundos"
                        disabled={!selected.audio_url || !Number.isFinite(durationSec) || durationSec <= 0}
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                          <path d="M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M4 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>

                      <div className="ml-auto text-[10px] text-gray-500">
                        {isPlaying ? "Reproduciendo" : "En pausa"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <audio
                ref={audioRef}
                src={selected.audio_url || ""}
                preload="metadata"
                onLoadedMetadata={() => {
                  const el = audioRef.current;
                  const d = el?.duration;
                  if (Number.isFinite(d)) setDurationSec(d);
                }}
                onTimeUpdate={() => {
                  const el = audioRef.current;
                  if (!el || isSeeking) return;
                  const t = el.currentTime;
                  if (Number.isFinite(t)) setCurrentTimeSec(t);
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="lg:hidden mt-4">
        <div className="relative rounded-2xl border border-black/5 bg-white/90 backdrop-blur-xl p-4 shadow-[0_18px_60px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="pointer-events-none absolute inset-0 opacity-80">
            <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full blur-3xl" style={{ background: "rgba(0,184,169,0.14)" }} />
            <div className="absolute -bottom-14 -left-16 h-52 w-52 rounded-full blur-3xl" style={{ background: "rgba(0,45,98,0.10)" }} />
          </div>

          <div className="relative">
            <div className="text-sm font-extrabold text-azulInstitucional leading-tight">Regiones de Colombia</div>
            <div className="mt-0.5 text-[11px] text-gray-600">Filtra y busca sonidos destacados</div>
          </div>

          <div className="mt-3">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar sonidos..."
                className="w-full rounded-full bg-white/95 px-11 py-3 text-sm outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-turquesaAudioBrand shadow-[0_14px_40px_rgba(0,0,0,0.08)]"
              />
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path d="M21 21l-4.2-4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => setActiveRegion("")}
              className={cx(
                "w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm ring-1 transition duration-200",
                !activeRegion
                  ? "bg-azulInstitucional text-white ring-azulInstitucional/20"
                  : "bg-white/70 ring-black/5 text-gray-800 hover:bg-azulInstitucional/5"
              )}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className={cx("h-2.5 w-2.5 rounded-full ring-2 ring-white/80", !activeRegion ? "bg-white/90" : "bg-azulInstitucional")} />
                <span className={cx("font-semibold truncate", !activeRegion ? "text-white" : "text-gray-900")}>Todas las Regiones</span>
              </span>
              <span className={cx("text-[11px]", !activeRegion ? "text-white/80" : "text-gray-500")}>{totalCount} sonidos</span>
            </button>

            {REGIONS.map((r) => {
              const active = r === activeRegion;
              const th = themeFor(r);
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setActiveRegion(r)}
                  className={cx(
                    "w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm ring-1 transition duration-200",
                    active
                      ? "bg-turquesaAudioBrand text-white ring-turquesaAudioBrand/30"
                      : "bg-white/70 ring-black/5 text-gray-800 hover:bg-turquesaAudioBrand/5"
                  )}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className={cx("h-2.5 w-2.5 rounded-full ring-2", active ? "ring-white/80" : "ring-white")}
                      style={{ background: active ? "rgba(255,255,255,0.92)" : th.a }}
                    />
                    <span className={cx("font-semibold truncate", active ? "text-white" : "text-gray-900")}>{r}</span>
                  </span>
                  <span className={cx("text-[11px]", active ? "text-white/85" : "text-gray-500")}>{counts.get(r) || 0} sonidos</span>
                </button>
              );
            })}
          </div>

          {loading ? <div className="mt-3 text-xs text-gray-600">Cargando mapa...</div> : null}
          {!loading && error ? <div className="mt-3 text-xs text-red-600">{error}</div> : null}
          {!loading && !error && !items.length ? (
            <div className="mt-3 text-xs text-gray-600">Aún no hay audios destacados por región.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
