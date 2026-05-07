"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavItem({ href, label, icon, active }) {
  return (
    <Link
      href={href}
      className={
        active
          ? "group flex items-center gap-3 rounded-2xl bg-turquesaAudioBrand/10 px-3 py-2.5 text-sm font-extrabold text-turquesaAudioBrand ring-1 ring-turquesaAudioBrand/20"
          : "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-extrabold text-azulInstitucional hover:bg-azulInstitucional/5"
      }
    >
      <span
        className={
          active
            ? "flex h-10 w-10 items-center justify-center rounded-2xl bg-turquesaAudioBrand/15 ring-1 ring-turquesaAudioBrand/20"
            : "flex h-10 w-10 items-center justify-center rounded-2xl bg-azulInstitucional/5 ring-1 ring-azulInstitucional/10 group-hover:bg-turquesaAudioBrand/10 group-hover:text-turquesaAudioBrand"
        }
      >
        {icon}
      </span>
      <span className="min-w-0 truncate">{label}</span>
    </Link>
  );
}

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5l9-7 9 7V21a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1v-10.5z" />
    </svg>
  );
}

function IconHeadphones() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 13a8 8 0 0116 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 13v5a2 2 0 002 2h1v-7H6a2 2 0 00-2 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13v5a2 2 0 01-2 2h-1v-7h1a2 2 0 012 2z" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 3H5a2 2 0 00-2 2v5a2 2 0 002 2h5a2 2 0 002-2V5a2 2 0 00-2-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 3h-5a2 2 0 00-2 2v5a2 2 0 002 2h5a2 2 0 002-2V5a2 2 0 00-2-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5a2 2 0 00-2 2v5a2 2 0 002 2h5a2 2 0 002-2v-5a2 2 0 00-2-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14h-5a2 2 0 00-2 2v5a2 2 0 002 2h5a2 2 0 002-2v-5a2 2 0 00-2-2z" />
    </svg>
  );
}

function IconMap() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v15" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 6v15" />
    </svg>
  );
}

function IconMic() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 013 3v8a3 3 0 11-6 0V4a3 3 0 013-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19v4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 23h8" />
    </svg>
  );
}

function IconSpark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l3-3 4 8 4-8 3 3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  );
}

function IconMusic() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18V5l12-2v13" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18a3 3 0 106 0 3 3 0 00-6 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 16a3 3 0 10-6 0 3 3 0 006 0z" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      />
    </svg>
  );
}

export default function Sidebar({ onNavigate }) {
  const pathname = usePathname();

  const items = [
    { href: "/app/dashboard", label: "Dashboard", icon: <IconHome /> },
    { href: "/app/albums/campesena", label: "Álbum CampeSENA", icon: <IconHeadphones /> },
    { href: "/app/favoritos", label: "Favoritos", icon: <IconHeart /> },
    { href: "/app/sonidos", label: "Estrategias", icon: <IconGrid /> },
    { href: "/app/mapa", label: "Mapa", icon: <IconMap /> },
    { href: "/app/sonidos-mapa", label: "Explorar Mapa", icon: <IconMusic /> },
    { href: "/app/musicos", label: "Músicos", icon: <IconMic /> },
    { href: "/app/perfil", label: "Perfil", icon: <IconUser /> },
  ];

  return (
    <aside className="h-full w-72 shrink-0">
      <div className="sticky top-0 h-screen overflow-y-auto border-r border-gray-200 bg-white">
        <div className="px-5 pt-7 pb-5">
          <div className="rounded-3xl bg-azulInstitucional p-4 ring-1 ring-black/5">
            <div className="text-white font-extrabold tracking-tight">Patrimonio Sonoro</div>
            <div className="mt-1 text-xs font-bold text-white/75">Tu espacio privado</div>
          </div>
        </div>

        <nav className="px-4 pb-8">
          <div className="text-xs font-extrabold tracking-wide text-gray-500 px-2 mb-3">Navegación</div>
          <div className="space-y-2">
            {items.map((it) => {
              const active = pathname === it.href || (it.href !== "/app/dashboard" && pathname?.startsWith(it.href));
              return (
                <div
                  key={it.href}
                  onClick={() => {
                    if (typeof onNavigate === "function") onNavigate();
                  }}
                >
                  <NavItem href={it.href} label={it.label} icon={it.icon} active={active} />
                </div>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
}
