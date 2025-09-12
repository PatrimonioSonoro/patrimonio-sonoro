"use client";

export default function RevealOnScroll({ children, className = '' }) {
  // Animations disabled: render children directly without IntersectionObserver or motion
  return (
    <div className={className}>
      {children}
    </div>
  );
}
