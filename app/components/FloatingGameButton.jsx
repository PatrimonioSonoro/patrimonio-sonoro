"use client";
import React, { useRef, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function FloatingGameButton({ gameLink = null }) {
  const pathname = usePathname?.() ?? null;
  // Do not render the floating button inside the admin/dashboard area
  if (pathname && pathname.startsWith('/dashboard')) return null;
  const btnRef = useRef(null);
  const draggingRef = useRef(false);
  const lastPosRef = useRef({ x: 20, y: 24 }); // default offsets
  const [pos, setPos] = useState({ left: 20, bottom: 24 });

  useEffect(() => {
    // initialize from lastPosRef
    setPos({ left: lastPosRef.current.x, bottom: lastPosRef.current.y });
  }, []);

  const handleClick = (e) => {
    if (!gameLink) return; // placeholder: link can be provided later
    window.open(gameLink, '_blank');
  };

  // Helpers to convert client coords into left/bottom clamped to viewport
  const clampToViewport = (clientX, clientY, width = 64, height = 64) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const left = Math.min(Math.max(6, clientX - width / 2), vw - width - 6);
    const bottom = Math.min(Math.max(6, vh - clientY - height / 2), vh - height - 6);
    return { left, bottom };
  };

  const onPointerDown = (e) => {
    e.preventDefault();
    draggingRef.current = true;
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    const coords = clampToViewport(e.clientX, e.clientY);
    setPos(coords);
    lastPosRef.current = { x: coords.left, y: coords.bottom };
  };

  const onPointerUp = () => {
    draggingRef.current = false;
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
  };

  // touch fallback handled by pointer events

  return (
    <div>
      <button
        ref={btnRef}
        className="floating-game-btn"
        onClick={handleClick}
        aria-label="Juega aquí"
        title="Juega aquí"
        onPointerDown={onPointerDown}
        style={{ left: `${pos.left}px`, bottom: `${pos.bottom}px` }}
      >
        <img src="/images/logo_sin_letra.png" alt="Patrimonio Sonoro" />
      </button>

      <div className="floating-game-tooltip" aria-hidden>
        Juega aquí
      </div>

      <style jsx>{`
        .floating-game-btn {
          position: fixed;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--surface, #ffffff);
          box-shadow: 0 6px 18px rgba(2,6,23,0.2);
          border: none;
          cursor: grab;
          z-index: 60;
          padding: 8px;
          touch-action: none; /* allow pointer events to handle touch drag */
        }
        .floating-game-btn:active { cursor: grabbing; }
        .floating-game-btn img {
          width: 40px;
          height: 40px;
          object-fit: contain;
          display: block;
          pointer-events: none;
        }
        .floating-game-tooltip {
          position: fixed;
          left: calc(var(--floating-left, 96px)); /* will not be precise when dragged but still shows */
          bottom: calc(var(--floating-bottom, 36px));
          background: rgba(0,0,0,0.85);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
          z-index: 61;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 160ms ease, transform 160ms ease;
          pointer-events: none;
        }
        .floating-game-btn:focus + .floating-game-tooltip,
        .floating-game-btn:hover + .floating-game-tooltip {
          opacity: 1;
          transform: translateY(0);
        }

        @media (max-width: 640px) {
          .floating-game-btn { width: 56px; height: 56px; }
          .floating-game-tooltip { font-size: 13px; }
        }
      `}</style>
    </div>
  );
}
