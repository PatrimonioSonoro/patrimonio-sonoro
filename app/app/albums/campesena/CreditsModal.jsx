"use client";

import { AnimatePresence, motion } from "framer-motion";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function IconX({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

export default function CreditsModal({ open, song, children, onClose }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose?.();
          }}
          tabIndex={-1}
        >
          <div className="absolute inset-0 bg-black/70" />

          <div className="absolute inset-0 flex items-end sm:items-center justify-center p-3 sm:p-6">
            <motion.div
              className={cx(
                "w-full sm:max-w-3xl",
                "rounded-3xl border border-white/10 overflow-hidden",
                "shadow-[0_30px_120px_rgba(0,0,0,0.65)]"
              )}
              style={{ background: "rgba(18,18,18,0.72)", backdropFilter: "blur(16px)" }}
              initial={{ y: 22, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 22, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              <div className="p-4 sm:p-6 border-b border-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-black tracking-widest text-white/60">FICHA TÉCNICA MUSICAL</div>
                    <div className="mt-2 font-extrabold text-white truncate">{song?.title || "Créditos"}</div>
                    {song?.artist ? <div className="text-xs text-white/60 truncate">{song.artist}</div> : null}
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/10 hover:border-white/20 transition"
                    style={{ background: "rgba(0,0,0,0.28)", color: "rgba(255,255,255,0.9)" }}
                    title="Cerrar"
                  >
                    <IconX className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="max-h-[72vh] sm:max-h-[78vh] overflow-auto p-4 sm:p-6">
                {children}
              </div>

              <div className="p-4 sm:p-6 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl px-4 py-2 text-sm font-extrabold border border-white/10 hover:border-white/20 transition"
                  style={{ background: "rgba(0,0,0,0.30)", color: "#fff" }}
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
