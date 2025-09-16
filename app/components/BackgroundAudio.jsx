"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function BackgroundAudio({ src = "/audios/audio_home.mp3", volume = 0.12 }) {
  const audioRef = useRef(null);
  const [playedOnce, setPlayedOnce] = useState(false);
  const pathname = usePathname();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Play only on the homepage and only once per page load
    if (pathname !== "/") return;
    if (playedOnce) return;

    audio.loop = false; // play only once
    audio.preload = "auto";
    audio.volume = volume;

    const tryUnmutedPlay = async () => {
      audio.muted = false;
      try {
        await audio.play();
        setPlayedOnce(true);
        setPlaying(true);
        setMuted(false);
        return true;
      } catch (err) {
        return false;
      }
    };

    const tryMutedPlay = async () => {
      audio.muted = true;
      try {
        await audio.play();
        setPlayedOnce(true);
        setPlaying(true);
        setMuted(true);
        return true;
      } catch (err) {
        return false;
      }
    };

    let settled = false;

    const onHeroPlay = async (e) => {
      if (settled) return;
      settled = true;
      try {
        const heroTime = e?.detail?.currentTime || 0;
        // sync audio position
        audio.currentTime = Math.max(0, heroTime);
        audio.muted = false;
        await audio.play().catch(() => {});
        setPlayedOnce(true);
        setPlaying(true);
        setMuted(false);
      } catch (err) {
        // fallback to previous behavior
        const unmutedOk = await tryUnmutedPlay();
        if (!unmutedOk) await tryMutedPlay();
      } finally {
        clearTimeout(fallbackTimer);
        window.removeEventListener('hero-video-play', onHeroPlay);
      }
    };

    // If HeroCarousel dispatches an event when its video starts, use that to sync
    window.addEventListener('hero-video-play', onHeroPlay);

    // fallback: if no hero event within 250ms, attempt autoplay as before
    const fallbackTimer = setTimeout(async () => {
      if (settled) return;
      settled = true;
      window.removeEventListener('hero-video-play', onHeroPlay);
      const unmutedOk = await tryUnmutedPlay();
      if (!unmutedOk) await tryMutedPlay();
    }, 250);

    // If muted fallback was used, try to unmute on first user gesture (without UI)
    const onFirstGesture = async () => {
      if (!audio) return;
      if (audio.muted) {
        try {
          audio.muted = false;
          // Only attempt to play if it hasn't finished yet
          if (audio.paused) {
            await audio.play().catch(() => {});
          }
        } catch (_) {
          audio.muted = true;
        }
      }
      window.removeEventListener('click', onFirstGesture);
      window.removeEventListener('keydown', onFirstGesture);
      window.removeEventListener('touchstart', onFirstGesture);
    };

    window.addEventListener('click', onFirstGesture, { once: true });
    window.addEventListener('keydown', onFirstGesture, { once: true });
    window.addEventListener('touchstart', onFirstGesture, { once: true });

    return () => {
      clearTimeout(fallbackTimer);
      window.removeEventListener('hero-video-play', onHeroPlay);
      window.removeEventListener('click', onFirstGesture);
      window.removeEventListener('keydown', onFirstGesture);
      window.removeEventListener('touchstart', onFirstGesture);
      if (audio && !audio.paused) audio.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, playedOnce, volume]);

  // Invisible element: no buttons, no UI. The audio element exists to autoplay once.
  // Control handlers for UI buttons
  const handleTogglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      // ensure audio is unmuted and volume set when user explicitly clicks
      try { audio.muted = false; } catch {}
      try { audio.volume = volume; } catch {}
      try {
        await audio.play();
        setPlaying(true);
      } catch (err) {}
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  return (
    <div aria-hidden={false} style={{ position: "fixed", right: '1rem', bottom: 'calc(1rem + 176px + 1.8rem + 0.5rem)', zIndex: 1210 }}>
      <audio ref={audioRef} src={src} playsInline preload="auto" crossOrigin="anonymous" />
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleTogglePlay}
          aria-pressed={playing}
          aria-label={playing ? "オーディオロゴを一時停止" : "オーディオロゴを再生"}
          title={playing ? "オーディオロゴを一時停止" : "オーディオロゴを再生"}
          className={`audio-cta ${playing ? 'is-playing' : ''}`}
        >
          {/* subtle wave svg (stacked) using currentColor for dynamic color */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M3 8c2-3 4-3 6 0s4 3 6 0 4-3 6 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
            <path d="M3 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
          </svg>

          <span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1 }}>{'オーディオロゴ'}</span>
        </button>
      </div>
    </div>
  );
}
