"use client";

import { useRef, useState } from "react";
import ViewCount from './ViewCount';

export default function CampaignCard({ title, description, videoSrc, posterSrc, ctaHref }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  const handlePlayClick = () => {
    setPlaying(true);
    // Play when the video element is mounted
    requestAnimationFrame(() => {
      try {
        videoRef.current?.play();
      } catch (e) {
        // Autoplay may be blocked by browser policies; keep controls visible
        console.warn('Autoplay blocked or play error', e);
      }
    });
  };

  return (
    <div className="bg-grisClaro p-8 rounded-2xl shadow-xl transform hover:-translate-y-2 transition-all">
  <div className="mb-6">
        {!playing ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-black">
            {posterSrc ? (
              <img
                src={posterSrc}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">No preview</div>
            )}

            <button
              aria-label={`Play ${title}`}
              onClick={handlePlayClick}
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-90 rounded-full p-3 shadow-lg hover:scale-105 transition-transform"
              style={{ width: 56, height: 56 }}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="#0f172a" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="w-full h-48 bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              controls
              className="w-full h-full object-cover"
              poster={posterSrc}
              playsInline
            >
              <source src={videoSrc} type="video/mp4" />
              Tu navegador no soporta video.
            </video>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-2xl md:text-3xl font-extrabold text-azulInstitucional mb-2">{title}</h3>
        <p className="text-gray-700 mb-0">{description}</p>
      </div>
      {ctaHref ? (
        <div className="mt-6 flex items-center justify-between">
          <a href={ctaHref} target="_blank" rel="noopener noreferrer" className="campaign-cta">Seguir viendo</a>
          {(() => {
            const mapping = {
              'campesena': 9498,
              'campesino canta': 2975,
              'full popular': 3981,
            };
            const titleKey = (title || '').toLowerCase().trim();
            const value = mapping[titleKey] ?? null;
            return value != null ? <ViewCount value={value} compact={true} showIcon={true} iconSize={16} color="#0f4a77" className="ml-4" startOnVisible={true} /> : null;
          })()}
        </div>
      ) : null}
    </div>
  );
}
