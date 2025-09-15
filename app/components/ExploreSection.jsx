"use client";

import React, { useMemo, useState, useEffect } from 'react';
import ContentMediaPlayer from './ContentMediaPlayer';
import ViewCount from './ViewCount';

export default function ExploreSection({ contents = [] }) {
  // Inicializamos en 'audio' para mostrar Audios por defecto
  const [category, setCategory] = useState('audio');

  const filtered = useMemo(() => {
    if (category === 'all') return contents;
    if (category === 'audio') return contents.filter(c => !!c.audio_url);
    if (category === 'video') return contents.filter(c => !!c.video_url);
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
      <div className="flex items-center justify-center gap-3 mb-6">
        <button onClick={() => setCategory('audio')} className={`px-4 py-2 rounded-full ${category==='audio'? 'bg-turquesaAudioBrand text-white' : 'bg-white text-gray-700 shadow-sm'}`} style={{ cursor: 'pointer' }}>Audios</button>
        <button onClick={() => setCategory('video')} className={`px-4 py-2 rounded-full ${category==='video'? 'bg-turquesaAudioBrand text-white' : 'bg-white text-gray-700 shadow-sm'}`} style={{ cursor: 'pointer' }}>Videos</button>
        <button onClick={() => setCategory('image')} className={`px-4 py-2 rounded-full ${category==='image'? 'bg-turquesaAudioBrand text-white' : 'bg-white text-gray-700 shadow-sm'}`} style={{ cursor: 'pointer' }}>Imágenes</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="text-gray-600">No hay contenidos en esta categoría.</div>
        ) : (
            filtered.map((c, idx) => (
              <div
                key={c.id}
                className="sound-card-modern"
              >
                <div className="sound-card-content">
                  <div className="sound-card-meta">
                    <span className="region-badge">{c.region || 'General'}</span>
                  </div>
                  <div>
                    <h3 className="sound-title">{c.title}</h3>
                    <p className="sound-description">{c.description}</p>
                  </div>
                  <div className="mt-3">
                    {/* If it's an image-only content, show img; otherwise use player */}
                    {category === 'image' && c.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.image_url}
                        alt={c.title}
                        className="w-full h-48 object-cover rounded-md cursor-pointer"
                        onClick={() => setLightboxSrc(c.image_url)}
                      />
                    ) : (
                      <ContentMediaPlayer content={c} />
                    )}
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
