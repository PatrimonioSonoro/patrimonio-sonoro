import React from "react";

import SectionHeading from "./SectionHeading";
import InfoCard from "./InfoCard";

function IconLibrary(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5V6a2 2 0 012-2h12a2 2 0 012 2v13.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 17h12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 8h8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11h8" />
    </svg>
  );
}

function IconWave(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12c2.5 0 2.5-6 5-6s2.5 12 5 12 2.5-12 5-12 2.5 6 5 6" />
    </svg>
  );
}

function IconCap(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l10 5-10 5L2 8l10-5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 10v6c0 1.5 3 3 6 3s6-1.5 6-3v-6" />
    </svg>
  );
}

function IconUsers(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 11a4 4 0 100-8 4 4 0 000 8z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21v-2a4 4 0 00-3-3.87" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

export default function WhatIsSection() {
  return (
    <section
      id="que-es"
      className="py-20 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#0b2f4a]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/15" />
      <div className="absolute inset-0 opacity-12 bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.45),transparent_48%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.22),transparent_42%)]" />
      <div className="pointer-events-none absolute -top-28 -right-28 h-72 w-72 rounded-full bg-turquesaAudioBrand/14 blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-5xl mx-auto">
          <SectionHeading
            title="¿Qué es Patrimonio Sonoro?"
            subtitle="Una plataforma del SENA para preservar lo que se escucha"
            variant="light"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            <InfoCard
              title="Banco sonoro"
              description="Un repositorio abierto para explorar, escuchar y aprender desde el territorio."
              accentClass="bg-turquesaAudioBrand"
              icon={<IconLibrary className="h-6 w-6 text-white" aria-hidden="true" />}
            />
            <InfoCard
              title="Preservación cultural"
              description="Salvaguardamos memorias auditivas y expresiones sonoras que construyen identidad."
              accentClass="bg-amarilloVibrante"
              icon={<IconWave className="h-6 w-6 text-white" aria-hidden="true" />}
            />
            <InfoCard
              title="Plataforma educativa"
              description="Contenido útil para aprendices, instructores e instituciones culturales y educativas."
              accentClass="bg-verdeSena"
              icon={<IconCap className="h-6 w-6 text-white" aria-hidden="true" />}
            />
            <InfoCard
              title="Participación comunitaria"
              description="Visibilizamos voces locales y promovemos el uso responsable de licencias abiertas."
              accentClass="bg-turquesaAudioBrand"
              icon={<IconUsers className="h-6 w-6 text-white" aria-hidden="true" />}
            />
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl bg-white/12 ring-1 ring-white/20 px-6 py-5 backdrop-blur-sm">
            <div className="text-white/90">
              <div className="text-sm font-extrabold tracking-wide">Explora por módulos</div>
              <div className="mt-1 text-sm text-white/75">
                Banco Sonoro, Mapa Sonoro y próximamente perfiles de músicos.
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-turquesaAudioBrand px-5 py-3 text-sm font-extrabold text-white hover:brightness-110 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20"
              >
                Ir al Banco
              </a>
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-white/10 px-5 py-3 text-sm font-extrabold text-white ring-1 ring-white/20 hover:bg-white/15 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20"
              >
                Ver el mapa
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
