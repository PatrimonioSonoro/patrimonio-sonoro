import React from "react";

import SectionHeading from "./SectionHeading";

export default function CTASection() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-turquesaAudioBrand/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-azulInstitucional/10 blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-azulInstitucional to-[#061e2f] p-8 md:p-12 shadow-xl shadow-black/10 ring-1 ring-black/5">
            <SectionHeading
              title="Explora"
              subtitle="Accede al banco sonoro o inicia sesión para administrar y subir contenidos."
              variant="light"
            />

            <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:justify-center">
              <a
                href="/banco-sonoro"
                className="inline-flex items-center justify-center rounded-full bg-turquesaAudioBrand px-7 py-3 text-sm font-extrabold text-white hover:brightness-110 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20"
              >
                Explorar
              </a>
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-white/10 px-7 py-3 text-sm font-extrabold text-white ring-1 ring-white/20 hover:bg-white/15 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20"
              >
                Iniciar sesión
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
