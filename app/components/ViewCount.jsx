'use client';

import { useEffect, useRef, useState } from 'react';

// Simple animated count-up component (no external deps)
export default function ViewCount({ value = 0, duration = 1200, className = '', showIcon = true, iconSize = 18, color = '#0f4a77', vertical = false, compact = false, startOnVisible = true }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const startValue = useRef(0);
  const elRef = useRef(null);
  const hasStarted = useRef(false);

  const runAnimation = (from = 0, to = Number(value) || 0) => {
    cancelAnimationFrame(rafRef.current);
    startRef.current = null;
    startValue.current = from;

    if (to === startValue.current) return;

    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue.current + (to - startValue.current) * eased);
      setDisplay(current);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    if (!startOnVisible) {
      runAnimation(display, Number(value) || 0);
      return () => cancelAnimationFrame(rafRef.current);
    }

    if (typeof IntersectionObserver === 'undefined') {
      // Fallback: run immediately
      runAnimation(display, Number(value) || 0);
      return () => cancelAnimationFrame(rafRef.current);
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          // animate from 0 to value whenever it first becomes visible
          runAnimation(0, Number(value) || 0);
        }
      });
    }, { threshold: 0.2 });

    if (elRef.current) obs.observe(elRef.current);

    return () => {
      obs.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, startOnVisible]);

  // Format with thousands separator
  const formatted = display.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return (
    <div ref={elRef} className={`${vertical ? 'flex flex-col items-center' : 'inline-flex items-center'} gap-3 ${className}`}>
      {showIcon && (
        <div className="flex items-center justify-center rounded-full bg-white shadow-sm" style={{ width: iconSize + 10, height: iconSize + 10 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5c5 0 9.27 3.11 10.5 7-1.23 3.89-5.5 7-10.5 7S2.73 15.89 1.5 12C2.73 8.11 6 5 12 5z" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="white" />
            <circle cx="12" cy="12" r="3" fill={color} />
            <circle cx="12" cy="12" r="1.2" fill="#fff" />
          </svg>
        </div>
      )}
      <div className={`${vertical ? 'text-center' : 'flex flex-col leading-none'}`}>
        <span className="text-sm text-gray-500">Visualizaciones</span>
  <span className={`${compact ? 'text-lg md:text-xl' : 'text-2xl md:text-3xl'} font-extrabold`} style={{ color }}>{formatted}</span>
      </div>
    </div>
  );
}
