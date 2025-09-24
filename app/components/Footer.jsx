"use client";

import React from 'react';

export default function Footer() {
  return (
    <footer className="site-footer mt-12">
      <div className="footer-top bg-azulInstitucional text-white rounded-t-xl">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="footer-brand">
            <h3 className="text-xl font-bold">Patrimonio Sonoro</h3>
            <p className="mt-2 text-sm text-white/85">Preservando paisajes sonoros y promoviendo la cultura auditiva de Colombia.</p>
          </div>

          <nav className="footer-nav" aria-label="Enlaces de navegación">
            <h4 className="font-semibold">Navegación</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a className="px-3 py-2 text-sm font-bold text-white nav-link-hover" href="#inicio">Inicio</a></li>
              <li><a className="px-3 py-2 text-sm font-bold text-white nav-link-hover" href="#que-es">¿Qué es?</a></li>
              <li><a className="px-3 py-2 text-sm font-bold text-white nav-link-hover" href="#campanas">Explora</a></li>
              <li><a className="px-3 py-2 text-sm font-bold text-white nav-link-hover" href="#mapa-sonoro">Mapa Sonoro</a></li>
              <li><a className="px-3 py-2 text-sm font-bold text-white nav-link-hover" href="#nosotros">Nosotros</a></li>
            </ul>
          </nav>

          <div className="footer-contact">
            <h4 className="font-semibold">Ubicación</h4>
            {/*  --- IGNORE --- 
            <h4 className="font-semibold">Contacto</h4>
            <p className="mt-2 text-sm">Correo: <a className="footer-link" href="mailto:info@patrimoniosonoro.org">info@patrimoniosonoro.org</a></p>
            <p className="mt-1 text-sm">Tel: <a className="footer-link" href="tel:+571234567890">+57 1 234 567 890</a></p>
            */}
            <p className="mt-2 text-sm flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z" />
              </svg>
              <a className="footer-link" href="https://www.google.com/maps/search/Valledupar+Cesar+Colombia" target="_blank" rel="noreferrer">Valledupar, Cesar, Colombia</a>
            </p>

            <div className="mt-4 text-sm">
              <div className="font-semibold">Aliados</div>
              <ul className="mt-2 space-y-1">
                <li><a className="footer-link" href="https://www.sena.edu.co" target="_blank" rel="noreferrer">SENA</a></li>
                <li><a className="footer-link" href="" target="_blank" rel="noreferrer">AudioBrand</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom bg-negroSuave text-gray-300 py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-sm">
          <div>© {new Date().getFullYear()} Patrimonio Sonoro. Todos los derechos reservados.</div>
          <div className="mt-3 md:mt-0 flex items-center gap-4">
            <a href="" className="footer-link">Política de privacidad</a>
            <a href="" className="footer-link">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
