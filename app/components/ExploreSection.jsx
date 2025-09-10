"use client";

import React, { useMemo, useState } from 'react';
import ContentMediaPlayer from './ContentMediaPlayer';

export default function ExploreSection({ contents = [] }) {
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    if (category === 'all') return contents;
    if (category === 'audio') return contents.filter(c => !!c.audio_url);
    if (category === 'video') return contents.filter(c => !!c.video_url);
    if (category === 'image') return contents.filter(c => !!c.image_url);
    return contents;
  }, [contents, category]);

  return (
    <div>
      <div className="flex items-center justify-center gap-3 mb-6">
        <button onClick={() => setCategory('all')} className={`px-4 py-2 rounded-full ${category==='all'? 'bg-turquesaAudioBrand text-white' : 'bg-white text-gray-700 shadow-sm'}`}>Todos</button>
        <button onClick={() => setCategory('audio')} className={`px-4 py-2 rounded-full ${category==='audio'? 'bg-turquesaAudioBrand text-white' : 'bg-white text-gray-700 shadow-sm'}`}>Audios</button>
        <button onClick={() => setCategory('video')} className={`px-4 py-2 rounded-full ${category==='video'? 'bg-turquesaAudioBrand text-white' : 'bg-white text-gray-700 shadow-sm'}`}>Videos</button>
        <button onClick={() => setCategory('image')} className={`px-4 py-2 rounded-full ${category==='image'? 'bg-turquesaAudioBrand text-white' : 'bg-white text-gray-700 shadow-sm'}`}>Imágenes</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="text-gray-600">No hay contenidos en esta categoría.</div>
        ) : (
          filtered.map((c) => (
            <div key={c.id} className="sound-card-modern">
              <div className="sound-card-content">
                <div className="sound-card-meta">
                  <span className="region-badge">{c.region || 'General'}</span>
                </div>
                <h3 className="sound-title">{c.title}</h3>
                <p className="sound-description">{c.description}</p>
                <div className="mt-3">
                  {/* If it's an image-only content, show img; otherwise use player */}
                  {category === 'image' && c.image_url ? (
                    <img src={c.image_url} alt={c.title} className="w-full h-48 object-cover rounded-md" />
                  ) : (
                    <ContentMediaPlayer content={c} />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
