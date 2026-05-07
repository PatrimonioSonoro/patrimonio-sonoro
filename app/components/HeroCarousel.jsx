"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HeroCarousel() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (hash === '#buscar') {
      // Let the browser scroll first, then focus.
      setTimeout(() => inputRef.current?.focus?.(), 60);
    }
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    const q = (query || '').trim();
    router.push(q ? `/banco-sonoro?q=${encodeURIComponent(q)}` : '/banco-sonoro');
  };

  return (
    <section
      id="inicio"
      className="relative pt-20 md:pt-24 lg:pt-28 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-azulInstitucional via-[#0b2f4a] to-[#061e2f]" />
      <img
        src="/images/campesino_canta_banner.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-15"
        loading="lazy"
      />
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.55),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.30),transparent_40%)]" />
      <div className="absolute inset-0 bg-black/25" />

      <div className="container relative z-10 mx-auto px-4 py-16 md:py-24 min-h-[70vh] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="max-w-2xl">
            <p className="text-xs md:text-sm tracking-[0.24em] uppercase text-white/80">
              Patrimonio cultural sonoro de Colombia
            </p>
            <h1 className="mt-3 text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Esto suena a nosotros.
            </h1>
            <p className="mt-5 text-base md:text-lg text-white/80 leading-relaxed">
              Explora, escucha y preserva nuestra riqueza cultural a través de una experiencia digital única.
            </p>

            <form id="buscar" onSubmit={onSubmit} className="mt-7 scroll-mt-28">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 rounded-2xl bg-white/10 ring-1 ring-white/20 px-4 py-3">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/70" aria-hidden="true">
                      <path d="M21 21l-4.35-4.35" />
                      <circle cx="11" cy="11" r="7" />
                    </svg>
                    <input
                      ref={inputRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Buscar sonido, región o palabra clave..."
                      className="w-full bg-transparent text-white placeholder:text-white/60 outline-none text-sm md:text-base"
                      aria-label="Buscar sonido"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-extrabold text-azulInstitucional ring-1 ring-black/5 hover:bg-gray-50 transition"
                >
                  Buscar
                </button>
              </div>
            </form>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-turquesaAudioBrand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-black/20 hover:brightness-110 transition"
              >
                Explorar sonidos
              </a>
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-white/10 px-6 py-3 text-sm font-bold text-white ring-1 ring-white/20 hover:bg-white/15 transition"
              >
                Iniciar sesión
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="relative mx-auto flex w-full max-w-2xl items-center justify-center lg:justify-self-center">
              <img
                src="/images/logo_audio.png"
                alt="Patrimonio Sonoro"
                className="h-auto w-full max-w-[640px] object-contain drop-shadow-[0_34px_70px_rgba(0,0,0,0.45)]"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/*
Legacy Hero (Video)
-------------------
Se conserva comentado para poder restaurarlo en el futuro sin perder la implementación original.

"use client";
import React, { useEffect, useRef, useState } from 'react';

export default function HeroCarousel() {
  const count = 1;
  const wrapperRef = useRef(null);
  const bgVideoRef = useRef(null);
  const [videoHeight, setVideoHeight] = useState(160); // fallback immediate, slightly reduced
  const [videoAspect, setVideoAspect] = useState(16 / 9);
  const ACTIVE_SCALE = 1.0; // no scale so both containers keep same physical size
  const HEIGHT_REDUCTION = 0.8; // reduce final height to make cards a bit shorter
  const [availableHeight, setAvailableHeight] = useState(null);
  const MAX_VIEWPORT_RATIO = 0.4; // max fraction of viewport the carousel should use
  const [active, setActive] = useState(0);
  const intervalRef = useRef(null);

  const scrollToIndex = (index) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const items = wrapper.querySelectorAll('.carousel-item');
    const item = items[index];
    if (!item) return;
    // center the item in the wrapper when possible
    const wrapperWidth = wrapper.clientWidth;
    const itemWidth = item.clientWidth;
    const targetLeft = Math.max(0, item.offsetLeft - (wrapperWidth - itemWidth) / 2);
    wrapper.scrollTo({ left: targetLeft, behavior: 'smooth' });
    setActive(index);
  };

  useEffect(() => {
    // autoplay every 10s
    const start = () => {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setActive((a) => {
          const n = (a + 1) % count;
          scrollToIndex(n);
          return n;
        });
      }, 13000);
    };

    start();
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ensure video is playing in loop (muted) on mount and keep playing even when slide is not active
  useEffect(() => {
    const video = bgVideoRef.current;
    if (!video) return;
    try {
      // ensure the video loops continuously
      video.loop = true;
      video.muted = true; // required for autoplay without user interaction
      const p = video.play();
      const dispatchHeroPlay = () => {
        try {
          const ev = new CustomEvent('hero-video-play', { detail: { currentTime: video.currentTime || 0 } });
          window.dispatchEvent(ev);
        } catch (e) {}
      };
      if (p && p.then) {
        p.then(() => dispatchHeroPlay()).catch(() => dispatchHeroPlay());
      } else {
        // fallback: dispatch shortly after
        setTimeout(dispatchHeroPlay, 80);
      }
    } catch (e) {}
    return () => {};
  }, []);

  return (
    <section id="inicio" className="hero-carousel-section relative pt-20 md:pt-24 lg:pt-28 min-h-screen overflow-hidden">
      <video
        ref={bgVideoRef}
        src="/videos/LOGO_HORIZONTAL.mp4"
        preload="auto"
        playsInline
        muted
        loop
        autoPlay
        aria-hidden={true}
        tabIndex={-1}
        className="hero-bg-video hero-bg-video-desktop"
      />
      <video
        src="/videos/LOGO_AUDIOBRAND_VERTICAL.mp4"
        preload="auto"
        playsInline
        muted
        loop
        autoPlay
        aria-hidden={true}
        tabIndex={-1}
        className="hero-bg-video hero-bg-video-mobile"
      />
      <div className="container relative z-10 mx-auto px-4">
        <div
          className="carousel-wrapper flex space-x-6 overflow-x-auto py-6 scrollbar-hidden"
          ref={wrapperRef}
        >
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className={`carousel-item flex-shrink-0 ${i === active ? 'is-active ring-2 ring-turquesaAudioBrand' : ''}`}
              style={{ minHeight: '203px', ...(videoHeight ? { height: `${videoHeight}px` } : {}) }}
              aria-hidden={i !== active}
              role="group"
            >
              <div className="logo-inner" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                // Logo removed as requested - this space intentionally left blank
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
        .scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
        .hero-bg-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 35%; z-index: 0; display: block; }
        .hero-bg-video-desktop { display: block; }
        .hero-bg-video-mobile { display: none; }
        @media (max-width: 767px) {
          .hero-bg-video-desktop { display: none; }
          .hero-bg-video-mobile { display: block; }
        }
      `}</style>
    </section>
  );
}
*/
