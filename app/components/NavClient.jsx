"use client";
import React, { useState, useEffect } from "react";
import AuthModalButton from "./AuthModalButton";
import { supabase } from "../../lib/supabaseClient";
import { forceSignOut } from "../../lib/authUtils";

export default function NavClient() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        setUser(data?.user ?? null);
      } catch (e) {
        console.error('Error fetching user in NavClient', e);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') setUser(null);
      if (event === 'SIGNED_IN') setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

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
            <a href="#campanas" className="px-3 py-2 text-sm font-bold text-azulInstitucional nav-link-hover">Explora</a>
            <a href="#mapa-sonoro" className="px-3 py-2 text-sm font-bold text-azulInstitucional nav-link-hover">Mapa Sonoro</a>
            <a href="#nosotros" className="px-3 py-2 text-sm font-bold text-azulInstitucional nav-link-hover">Nosotros</a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <AuthModalButton />
            ) : (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium">{user.user_metadata?.nombre_completo || user.email}</span>
                </button>
                <div className={`user-menu absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg ${userMenuOpen ? 'block' : 'hidden'}`}>
                  <button
                    onClick={async () => {
                      await forceSignOut();
                      // Redirect to home
                      if (typeof window !== 'undefined') window.location.href = '/';
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
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

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            <a href="#inicio" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-bold text-azulInstitucional hover:text-turquesaAudioBrand hover:bg-gray-50 rounded-md transition-colors">Inicio</a>
            <a href="#que-es" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-bold text-azulInstitucional hover:text-turquesaAudioBrand hover:bg-gray-50 rounded-md transition-colors">¿Qué es?</a>
            <a href="#campanas" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-bold text-azulInstitucional hover:text-turquesaAudioBrand hover:bg-gray-50 rounded-md transition-colors">Explora</a>
            <a href="#mapa-sonoro" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-bold text-azulInstitucional hover:text-turquesaAudioBrand hover:bg-gray-50 rounded-md transition-colors">Mapa Sonoro</a>
            <a href="#nosotros" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-bold text-azulInstitucional hover:text-turquesaAudioBrand hover:bg-gray-50 rounded-md transition-colors">Nosotros</a>
          </div>
        </div>
      )}
    </nav>
  );
}
