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

  const next = () => {
    const nextIndex = (active + 1) % count;
    scrollToIndex(nextIndex);
  };

  const prev = () => {
    const prevIndex = (active - 1 + count) % count;
    scrollToIndex(prevIndex);
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

  // measure video aspect and compute container height from card width
  useEffect(() => {
    const video = bgVideoRef.current;
    if (!video) return;

    const updateAspect = () => {
      const w = video.videoWidth || parseInt(video.getAttribute('width')) || 0;
      const h = video.videoHeight || parseInt(video.getAttribute('height')) || 0;
      if (w && h) setVideoAspect(w / h);
    };

    const updateHeight = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const items = wrapper.querySelectorAll('.carousel-item');
      // prefer measuring the first item (card width) or the active one
      const item = items[0] || items[active] || null;
      const cardW = item ? item.clientWidth : Math.round(wrapper.clientWidth * 0.9);
  const baseH = Math.max(160, Math.round(cardW / (videoAspect || (16 / 9))));
  // if active slide is scaled, apply small scale so layout doesn't jump
  const scaled = Math.ceil(baseH * ACTIVE_SCALE);
      const reduced = Math.ceil(scaled * HEIGHT_REDUCTION);
      // if availableHeight is known, clamp to it
  const final = availableHeight ? Math.min(reduced, availableHeight) : reduced;
  setVideoHeight(Math.max(final, 150));
    };

    // listen for when metadata is available to get intrinsic size
    video.addEventListener('loadedmetadata', () => {
      updateAspect();
      updateHeight();
    });
    video.addEventListener('canplay', () => {
      updateAspect();
      updateHeight();
    });
    // window resize should recalc
    window.addEventListener('resize', updateHeight);

    // initial measure after render
    setTimeout(() => {
      updateAspect();
      updateHeight();
    }, 120);

    return () => {
      video.removeEventListener('loadedmetadata', updateAspect);
      video.removeEventListener('canplay', updateAspect);
      window.removeEventListener('resize', updateHeight);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoAspect]);

  // recalc height when active changes (so centered active scale is accounted)
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const items = wrapper.querySelectorAll('.carousel-item');
    const item = items[0] || items[active] || null;
  const cardW = item ? item.clientWidth : Math.round(wrapper.clientWidth * 0.9);
  const baseH = Math.max(160, Math.round(cardW / (videoAspect || (16 / 9))));
  const scaled = Math.ceil(baseH * ACTIVE_SCALE);
  const reduced = Math.ceil(scaled * HEIGHT_REDUCTION);
  const final = availableHeight ? Math.min(reduced, availableHeight) : reduced;
  setVideoHeight(Math.max(final, 150));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // compute available height in viewport for the carousel container (space left on first page)
  useEffect(() => {
    const computeAvailable = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return setAvailableHeight(null);
      const rect = wrapper.getBoundingClientRect();
      // space from top of wrapper to bottom of viewport minus small margin
      let avail = Math.max(120, Math.floor(window.innerHeight - rect.top - 40));
      // cap to a fraction of the viewport to avoid occupying the full screen
      const cap = Math.floor(window.innerHeight * MAX_VIEWPORT_RATIO);
      avail = Math.min(avail, cap);
      setAvailableHeight(avail);
    };
    window.addEventListener('resize', computeAvailable);
    // also compute on mount
    setTimeout(computeAvailable, 80);
    return () => window.removeEventListener('resize', computeAvailable);
  }, []);

  // when the slide becomes active ensure it's playing (remains playing at all times otherwise)
  useEffect(() => {
    const video = bgVideoRef.current;
    if (!video) return;
    if (active === 0) {
      try {
        video.muted = true;
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
          setTimeout(dispatchHeroPlay, 80);
        }
      } catch (e) {}
    }
  }, [active]);

  // pause on hover
  const handleMouseEnter = () => clearInterval(intervalRef.current);
  const handleMouseLeave = () => {
    clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setActive((a) => {
          const n = (a + 1) % count;
          scrollToIndex(n);
          return n;
        });
      }, 13000);
  };

  return (
  <section id="inicio" className="hero-carousel-section relative pt-20 md:pt-24 lg:pt-28 min-h-screen overflow-hidden">
      {/* Full-bleed background video (desktop: horizontal, mobile: vertical) */}
      <video
        ref={bgVideoRef}
        src="/videos/LOGO_AUDIOBRAND_HORIZONTAL.mp4"
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
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* 5 contenedores responsivos (placeholders) */}
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className={`carousel-item flex-shrink-0 ${i === active ? 'is-active ring-2 ring-turquesaAudioBrand' : ''}`}
                style={{ minHeight: '203px', ...(videoHeight ? { height: `${videoHeight}px` } : {}) }}
              aria-hidden={i !== active}
              role="group"
            >
              <div className="logo-inner" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Logo removed as requested - this space intentionally left blank */}
              </div>
            </div>
          ))}
        </div>

  {/* Navigation arrows removed as requested */}

  {/* Indicators removed for single-slide layout */}
      </div>

        <style jsx>{`
  .scrollbar-hidden::-webkit-scrollbar { display: none; }
  .scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }

  /* center the wrapper content and control gap */
  .carousel-wrapper { padding: 16px 0; margin: 0 auto; gap: 24px; }

  .carousel-item { transition: transform 260ms ease, box-shadow 260ms ease; scroll-snap-align: center; }
  .carousel-item.is-active { transform: translateY(-6px); z-index: 20; box-shadow: none; }
  .carousel-item:not(.is-active) { transform: translateY(0) scale(1); z-index: 10; box-shadow: none; }

  /* Default mobile: single card, full width with side padding */
  /* Make the card fill the wrapper inner width (respecting 16px gutters) on mobile */
  .carousel-wrapper { padding: 12px 0; padding-left: 16px; padding-right: 16px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; }
  .carousel-item { width: 100% !important; max-width: none !important; box-sizing: border-box; min-height: 203px; background: transparent; border-radius: 0; }

        /* Desktop and up: enforce card size range
           - Width between 350px and 400px
           - Height between 450px and 550px
           Cards will keep these constraints and the wrapper will allow horizontal scrolling when needed. */
        @media (min-width: 768px) {
          /* show one centered card on tablets and desktop; card width adapts to viewport */
          .carousel-wrapper { padding: 18px 0; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; --card-w: clamp(350px, 95vw, 1200px); padding-left: calc((100% - var(--card-w)) / 2); padding-right: calc((100% - var(--card-w)) / 2); }
          .carousel-item {
            width: var(--card-w) !important; /* adaptive card width (up to 95vw) */
            min-width: auto !important;
            max-width: none !important;
            min-height: 480px;
          }
        }

        /* Extra large: allow slightly larger card width but still centered */
        @media (min-width: 1280px) {
          .carousel-wrapper { --card-w: clamp(350px, 95vw, 1400px); padding-left: calc((100% - var(--card-w)) / 2); padding-right: calc((100% - var(--card-w)) / 2); }
          .carousel-item { min-height: 520px; }
        }

        /* Hide arrows on smaller screens */
        @media (max-width: 767px) {
          .carousel-arrow { display: none; }
        }

        .carousel-arrow { z-index: 30; }
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
