
 'use client';

import { useState, useRef } from 'react';
import ViewCount from './ViewCount';

export default function ContentMediaPlayer({ content }) {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const videoRef = useRef(null);

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
    <div className="bg-gray-200 rounded-lg overflow-hidden relative">
      {/* Show image only when there is no video (video uses poster) */}
      {mediaUrls.image_url && !imageError && !mediaUrls.video_url && (
        <img 
          src={mediaUrls.image_url} 
          alt={content.title} 
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      )}

      {mediaUrls.video_url && !videoError && (
        // If the video is portrait we center it inside a fixed-height container so it displays correctly
        isPortrait ? (
          <div className="w-full h-96 bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              controls
              className="max-h-full w-auto"
              poster={mediaUrls.image_url}
              onLoadedMetadata={(e) => {
                const v = e.target;
                setIsPortrait(v.videoHeight > v.videoWidth);
              }}
              onPlay={() => {
                // Video play tracking removed
              }}
              onError={handleVideoError}
            >
              <source src={mediaUrls.video_url} type="video/mp4" />
              Tu navegador no soporta video HTML5.
            </video>
          </div>
        ) : (
          <div className="aspect-video w-full bg-black">
            <video 
              ref={videoRef}
              controls
              className="w-full h-full object-cover"
              poster={mediaUrls.image_url}
              onLoadedMetadata={(e) => {
                const v = e.target;
                setIsPortrait(v.videoHeight > v.videoWidth);
              }}
              onPlay={() => {
                // Video play tracking removed
              }}
              onError={handleVideoError}
            >
              <source src={mediaUrls.video_url} type="video/mp4" />
              Tu navegador no soporta video HTML5.
            </video>
          </div>
        )
      )}
      
      {mediaUrls.audio_url && !mediaUrls.video_url && !audioError && (
        <div className="w-full bg-gray-100">
          <div className="p-4 flex items-center justify-center">
            <audio 
              controls 
              className="w-full max-w-md" 
              onPlay={() => {
                // Audio play tracking removed
              }}
              onError={handleAudioError}
            >
              <source src={mediaUrls.audio_url} type="audio/mpeg" />
              <source src={mediaUrls.audio_url} type="audio/mp4" />
              <source src={mediaUrls.audio_url} type="audio/wav" />
              Tu navegador no soporta audio HTML5.
            </audio>
          </div>

          {/* View count removed from here; counts are shown in CampaignCard */}
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
