"use client";
import React, { useState } from "react";
import AuthModalButton from "./AuthModalButton";
import { motion } from "framer-motion";

export default function NavClient() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="nav-with-bg bg-white shadow-md fixed top-0 left-0 w-full z-[2000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="mr-3">
              <img src="/images/logo_sin_letra.png" alt="Patrimonio Sonoro" className="h-14 w-auto object-contain" />
            </div>
            <div>
              <span className="text-lg font-bold text-azulInstitucional">Patrimonio Sonoro</span>
              <div className="flex items-center text-[11px] text-gray-500 leading-none">
                <span>SENA</span>
                <span className="mx-1">•</span>
                <span>AudioBrand</span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <a href="#inicio" className="px-3 py-2 text-sm font-bold text-azulInstitucional nav-link-hover">Inicio</a>
            <a href="#que-es" className="px-3 py-2 text-sm font-bold text-azulInstitucional nav-link-hover">¿Qué es?</a>
            <a href="#explora" className="px-3 py-2 text-sm font-bold text-azulInstitucional nav-link-hover">Explora</a>
            <a href="#mapa-sonoro" className="px-3 py-2 text-sm font-bold text-azulInstitucional nav-link-hover">Mapa Sonoro</a>
            <a href="#nosotros" className="px-3 py-2 text-sm font-bold text-azulInstitucional nav-link-hover">Nosotros</a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <AuthModalButton />
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <AuthModalButton />
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-azulInstitucional p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Abrir menú de navegación"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <motion.div 
        initial={false}
        animate={mobileMenuOpen ? "open" : "closed"}
        variants={{
          open: { opacity: 1, height: "auto" },
          closed: { opacity: 0, height: 0 }
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="md:hidden bg-white border-t border-gray-200 overflow-hidden"
      >
        <div className="px-4 py-4 space-y-3">
          <a href="#inicio" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-bold text-azulInstitucional hover:text-turquesaAudioBrand hover:bg-gray-50 rounded-md transition-colors">Inicio</a>
          <a href="#que-es" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-bold text-azulInstitucional hover:text-turquesaAudioBrand hover:bg-gray-50 rounded-md transition-colors">¿Qué es?</a>
          <a href="#explora" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-bold text-azulInstitucional hover:text-turquesaAudioBrand hover:bg-gray-50 rounded-md transition-colors">Explora</a>
          <a href="#mapa-sonoro" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-bold text-azulInstitucional hover:text-turquesaAudioBrand hover:bg-gray-50 rounded-md transition-colors">Mapa Sonoro</a>
          <a href="#nosotros" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-bold text-azulInstitucional hover:text-turquesaAudioBrand hover:bg-gray-50 rounded-md transition-colors">Nosotros</a>
        </div>
      </motion.div>
    </nav>
  );
}
