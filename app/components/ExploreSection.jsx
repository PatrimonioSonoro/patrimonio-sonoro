"use client";

import React, { useMemo, useState, useEffect } from 'react';
import ContentMediaPlayer from './ContentMediaPlayer';
import ViewCount from './ViewCount';

export default function ExploreSection({ contents = [] }) {
  const [category] = useState('image');

  const filtered = useMemo(() => {
    if (category === 'image') return contents.filter(c => !!c.image_url);
    return contents;
  }, [contents, category]);

  const [lightboxSrc, setLightboxSrc] = useState(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setLightboxSrc(null);
    }
    if (lightboxSrc) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightboxSrc]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="text-gray-600 md:col-span-2 lg:col-span-3">No hay contenidos en esta categoría.</div>
        ) : (
            filtered.map((c, idx) => (
              <div
                key={c.id}
                className="group rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:border-turquesaAudioBrand/35 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-azulInstitucional/5 px-3 py-1 text-xs font-extrabold text-azulInstitucional ring-1 ring-azulInstitucional/10">
                      {c.region || 'Estrategia'}
                    </div>
                    <div className="text-[11px] font-extrabold text-gray-400">ESTRATEGIA</div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-base font-extrabold text-azulInstitucional leading-snug line-clamp-2">{c.title}</h3>
                    <p className="mt-2 text-sm text-gray-600 leading-snug line-clamp-3">{c.description}</p>
                  </div>

                  <div className="mt-4">
                    {c.image_url ? (
                      <button
                        type="button"
                        className="block w-full text-left"
                        onClick={() => setLightboxSrc(c.image_url)}
                        title="Ver imagen"
                      >
                        <div className="relative overflow-hidden rounded-2xl ring-1 ring-black/5 bg-gray-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={c.image_url}
                            alt={c.title}
                            className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.00) 40%, rgba(0,0,0,0.18) 100%)" }} />
                        </div>
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Lightbox overlay */}
      {lightboxSrc && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={() => setLightboxSrc(null)}
        >
          <div className="absolute top-4 right-4 z-60">
            <button
              aria-label="Cerrar imagen ampliada"
              onClick={() => setLightboxSrc(null)}
              className="bg-white text-gray-800 rounded-full p-2 shadow"
            >
              ×
            </button>
          </div>

          <div className="max-w-[95%] max-h-[95%] p-2" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightboxSrc} alt="Ampliado" className="w-full h-auto max-h-[90vh] object-contain rounded" />
          </div>
        </div>
      )}
    </div>
  );
}
