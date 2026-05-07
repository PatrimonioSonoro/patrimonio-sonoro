"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [drawerAnimate, setDrawerAnimate] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      setDrawerMounted(true);
      // Let the drawer mount off-screen, then animate in.
      const id = requestAnimationFrame(() => setDrawerAnimate(true));

      // Lock background scroll.
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        cancelAnimationFrame(id);
        document.body.style.overflow = prevOverflow;
      };
    }

    // Animate out, then unmount.
    setDrawerAnimate(false);
    const t = setTimeout(() => setDrawerMounted(false), 220);
    return () => clearTimeout(t);
  }, [open]);

  const title = useMemo(() => {
    const map = [
      { prefix: "/app/dashboard", label: "Dashboard" },
      { prefix: "/app/albums/campesena", label: "Álbum CampeSENA" },
      { prefix: "/app/favoritos", label: "Favoritos" },
      { prefix: "/app/sonidos", label: "Estrategias" },
      { prefix: "/app/mapa", label: "Mapa sonoro" },
      { prefix: "/app/sonidos-mapa", label: "Explorar Mapa" },
      { prefix: "/app/musicos", label: "Músicos" },
      { prefix: "/app/subir", label: "Subir" },
      { prefix: "/app/perfil", label: "Perfil" },
    ];

    const match = map.find((it) => pathname === it.prefix || pathname?.startsWith(it.prefix + "/"));
    return match?.label || "Patrimonio Sonoro";
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-gray-50">
      <div className="flex">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <div className="flex-1 min-w-0">
          <header className="lg:hidden sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center h-10 w-10 rounded-2xl bg-azulInstitucional/5 ring-1 ring-azulInstitucional/10 text-azulInstitucional"
                aria-label="Abrir menú"
              >
                <IconMenu />
              </button>
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-azulInstitucional truncate">{title}</div>
                <div className="text-xs text-gray-500 truncate">Área privada</div>
              </div>
              <div className="h-10 w-10" />
            </div>
          </header>

          <main className="min-w-0 pt-16 lg:pt-0">{children}</main>
        </div>
      </div>

      {drawerMounted ? (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div
            className={
              drawerAnimate
                ? "absolute inset-0 bg-black/40 opacity-100 transition-opacity duration-200"
                : "absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200"
            }
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className={
              drawerAnimate
                ? "absolute inset-y-0 left-0 w-[85vw] max-w-xs translate-x-0 transition-transform duration-200 ease-out"
                : "absolute inset-y-0 left-0 w-[85vw] max-w-xs -translate-x-full transition-transform duration-200 ease-out"
            }
          >
            <div className="h-full bg-white shadow-2xl">
              <Sidebar onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
