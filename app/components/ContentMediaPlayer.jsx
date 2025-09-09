'use client';

import { useMemo } from 'react';
import { getPublicUrl } from '../../lib/supabasePublic';

export default function ContentMediaPlayer({ content }) {
  // Generate public URLs from paths if URLs are not provided
  const mediaUrls = useMemo(() => {
    return {
      image_url: content.image_url || getPublicUrl(content.image_path),
      audio_url: content.audio_url || getPublicUrl(content.audio_path),
      video_url: content.video_url || getPublicUrl(content.video_path)
    };
  }, [content]);

  return (
    <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative">
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
      
      {!mediaUrls.image_url && !mediaUrls.video_url && !mediaUrls.audio_url && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
          Sin contenido multimedia
        </div>
      )}
    </div>
  );
}
