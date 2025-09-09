'use client';

import { useState } from 'react';

export default function ContentMediaPlayer({ content }) {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [audioError, setAudioError] = useState(false);

  // Use URLs directly from content (they're already public URLs from database)
  const mediaUrls = {
    image_url: content.image_url,
    audio_url: content.audio_url,
    video_url: content.video_url
  };

  const handleImageError = () => {
    console.error('Error loading image:', mediaUrls.image_url);
    setImageError(true);
  };

  const handleVideoError = (e) => {
    console.error('Error loading video:', mediaUrls.video_url, e.target.error);
    setVideoError(true);
  };

  const handleAudioError = (e) => {
    console.error('Error loading audio:', mediaUrls.audio_url, e.target.error);
    setAudioError(true);
  };

  return (
    <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative">
      {mediaUrls.image_url && !imageError && (
        <img 
          src={mediaUrls.image_url} 
          alt={content.title} 
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      )}
      
      {mediaUrls.video_url && !videoError && (
        <video 
          controls 
          className="w-full h-full"
          poster={mediaUrls.image_url}
          onError={handleVideoError}
        >
          <source src={mediaUrls.video_url} type="video/mp4" />
          Tu navegador no soporta video HTML5.
        </video>
      )}
      
      {mediaUrls.audio_url && !mediaUrls.video_url && !audioError && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <audio controls className="w-full max-w-md" onError={handleAudioError}>
            <source src={mediaUrls.audio_url} type="audio/mpeg" />
            <source src={mediaUrls.audio_url} type="audio/mp4" />
            <source src={mediaUrls.audio_url} type="audio/wav" />
            Tu navegador no soporta audio HTML5.
          </audio>
        </div>
      )}
      
      {/* Error states */}
      {videoError && mediaUrls.video_url && (
        <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-600 p-4">
          <div className="text-center">
            <div className="text-sm font-medium">Error cargando video</div>
            <div className="text-xs mt-1 opacity-75">URL: {mediaUrls.video_url}</div>
          </div>
        </div>
      )}
      
      {audioError && mediaUrls.audio_url && (
        <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-600 p-4">
          <div className="text-center">
            <div className="text-sm font-medium">Error cargando audio</div>
            <div className="text-xs mt-1 opacity-75">URL: {mediaUrls.audio_url}</div>
          </div>
        </div>
      )}
      
      {imageError && mediaUrls.image_url && (
        <div className="w-full h-full flex items-center justify-center bg-yellow-50 text-yellow-600 p-4">
          <div className="text-center">
            <div className="text-sm font-medium">Error cargando imagen</div>
            <div className="text-xs mt-1 opacity-75">URL: {mediaUrls.image_url}</div>
          </div>
        </div>
      )}
      
      {!mediaUrls.image_url && !mediaUrls.video_url && !mediaUrls.audio_url && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
          Sin contenido multimedia
        </div>
      )}
    </div>
  );
}
