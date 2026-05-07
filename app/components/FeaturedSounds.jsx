"use client";

import React, { useMemo } from "react";
import SoundCard from "./SoundCard";

export default function FeaturedSounds({ contents = [] }) {
  const featured = useMemo(() => {
    if (!Array.isArray(contents)) return [];

    const audioOnly = contents.filter(
      (c) => c && (typeof c.audio_url === "string" ? c.audio_url : c.audio_public_url)
    );

    const targetTitle = "SENA MI SEGUNDO HOGAR MASTER";
    const target = audioOnly.find(
      (c) => typeof c?.title === "string" && c.title.trim().toLowerCase() === targetTitle.toLowerCase()
    );

    const base = audioOnly.filter((c) => c && c !== target);
    return (target ? [target, ...base] : base).slice(0, 6);
  }, [contents]);

  return (
    <section id="sonidos-destacados" className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-azulInstitucional">
              Sonidos destacados
            </h2>
            <p className="mt-2 text-gray-600 max-w-2xl">
              Una selección reciente del banco sonoro. Dale play y explora por región.
            </p>
          </div>
          <a
            href="#explora"
            className="hidden sm:inline-flex items-center justify-center rounded-full bg-grisClaro px-5 py-2 text-sm font-bold text-azulInstitucional hover:bg-gray-200 transition"
          >
            Ver todo
          </a>
        </div>

        {featured.length === 0 ? (
          <div className="text-gray-600">Aún no hay contenidos publicados.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {featured.map((c) => (
              <SoundCard key={c.id} content={c} />
            ))}
          </div>
        )}

        <div className="mt-10 sm:hidden">
          <a
            href="#explora"
            className="inline-flex w-full items-center justify-center rounded-full bg-grisClaro px-5 py-3 text-sm font-bold text-azulInstitucional hover:bg-gray-200 transition"
          >
            Ver todo
          </a>
        </div>
      </div>
    </section>
  );
}
