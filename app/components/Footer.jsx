"use client";

import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-16">
      <div className="relative bg-gradient-to-b from-[#07253a] via-[#061e2f] to-[#03111b] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(45,212,191,0.10),transparent_55%),radial-gradient(circle_at_85%_25%,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-black/25" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-white/10 ring-1 ring-white/15 flex items-center justify-center">
                  <img
                    src="/images/logo_sin_letra_transparente.png"
                    alt="Patrimonio Sonoro"
                    className="h-6 w-6 object-contain"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-lg font-extrabold tracking-tight">Patrimonio Sonoro</h3>
              </div>
              <p className="mt-4 text-sm text-white/80 leading-relaxed max-w-sm">
                Preservando paisajes sonoros y promoviendo la cultura auditiva de Colombia.
              </p>
            </div>

            <nav aria-label="Enlaces de navegación">
              <h4 className="text-sm font-extrabold tracking-wide text-white/90">Navegación</h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <a className="text-white/90 hover:text-white transition" href="/#inicio">Inicio</a>
                </li>
                <li>
                  <a className="text-white/90 hover:text-white transition" href="/#que-es">¿Qué es?</a>
                </li>
                <li>
                  <a className="text-white/90 hover:text-white transition" href="/#nosotros">Nosotros</a>
                </li>
              </ul>
            </nav>

            <div>
              <h4 className="text-sm font-extrabold tracking-wide text-white/90">Acceso</h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <a className="text-white/90 hover:text-white transition" href="/banco-sonoro"></a>
                </li>
                <li>
                  <a className="text-white/90 hover:text-white transition" href="/login">Iniciar sesión</a>
                </li>
                <li>
                  <a className="text-white/90 hover:text-white transition" href="/register">Registrarse</a>
                </li>
              </ul>

              <div className="mt-8 text-sm">
                <div className="text-sm font-extrabold tracking-wide text-white/90">Aliados</div>
                <ul className="mt-3 space-y-2">
                  <li>
                    <a className="text-white/90 hover:text-white transition" href="https://www.sena.edu.co" target="_blank" rel="noreferrer">SENA</a>
                  </li>
                  <li>
                    <a className="text-white/90 hover:text-white transition" href="#">AudioBrand</a>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-extrabold tracking-wide text-white/90">Ubicación</h4>
              <p className="mt-4 text-sm text-white/90 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z" />
                </svg>
                <a
                  className="hover:text-white transition"
                  href="https://www.google.com/maps/search/Valledupar+Cesar+Colombia"
                  target="_blank"
                  rel="noreferrer"
                >
                  Valledupar, Cesar, Colombia
                </a>
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/70">
            <div>© {new Date().getFullYear()} Patrimonio Sonoro. Todos los derechos reservados.</div>
            <div className="flex items-center gap-4">
              <a href="/#inicio" className="hover:text-white transition">Política de privacidad</a>
              <a href="/#inicio" className="hover:text-white transition">Términos</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
