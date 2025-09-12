"use client";

export default function MotionLayout({ children }) {
  // Animations disabled: return a simple wrapper so layout structure remains the same
  return (
    <div style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
}
