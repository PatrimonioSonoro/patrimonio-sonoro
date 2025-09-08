'use client';

import { useState, useEffect } from 'react';

export default function ContentMediaPlayer({ content }) {
  const [mediaUrls, setMediaUrls] = useState({
    image_url: content.image_url,
    audio_url: content.audio_url,
    video_url: content.video_url
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If we don't have URLs from server-side rendering, fetch them client-side
    const needsUrls = !mediaUrls.image_url && content.image_path ||
                     !mediaUrls.audio_url && content.audio_path ||
                     !mediaUrls.video_url && content.video_path;

    if (needsUrls) {
      fetchMediaUrls();
    }
  }, [content]);

  const fetchMediaUrls = async () => {
    setLoading(true);
    try {
      const paths = [];
      if (content.image_path && !mediaUrls.image_url) paths.push(content.image_path);
      if (content.audio_path && !mediaUrls.audio_url) paths.push(content.audio_path);
      if (content.video_path && !mediaUrls.video_url) paths.push(content.video_path);

      if (paths.length > 0) {
        const response = await fetch('/api/public/signed-urls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths, expires: 3600 })
        });

        if (response.ok) {
          const { urls } = await response.json();
          setMediaUrls(prev => ({
            ...prev,
            image_url: urls[content.image_path] || prev.image_url,
            audio_url: urls[content.audio_path] || prev.audio_url,
            video_url: urls[content.video_path] || prev.video_url
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch media URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      )}
      
      {mediaUrls.image_url && (
        <img 
          src={mediaUrls.image_url} 
          alt={content.title} 
          className="w-full h-full object-cover"
        />
      )}
      
      {mediaUrls.video_url && (
        <video 
          controls 
          className="w-full h-full"
          poster={mediaUrls.image_url}
        >
          <source src={mediaUrls.video_url} type="video/mp4" />
          Tu navegador no soporta video HTML5.
        </video>
      )}
      
      {mediaUrls.audio_url && !mediaUrls.video_url && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <audio controls className="w-full max-w-md">
            <source src={mediaUrls.audio_url} type="audio/mpeg" />
            <source src={mediaUrls.audio_url} type="audio/mp4" />
            <source src={mediaUrls.audio_url} type="audio/wav" />
            Tu navegador no soporta audio HTML5.
          </audio>
        </div>
      )}
      
      {!mediaUrls.image_url && !mediaUrls.video_url && !mediaUrls.audio_url && !loading && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
          Sin contenido multimedia
        </div>
      )}
    </div>
  );
}
