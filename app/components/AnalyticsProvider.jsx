"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEvent } from '../../lib/analyticsSimple';

const AnalyticsContext = createContext(null);

export function AnalyticsProvider({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isInitialized, setIsInitialized] = useState(false);

  console.log('🚀 AnalyticsProvider inicializado en:', pathname);

  // Auto-track página inicial
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🚀 Tracking página inicial:', pathname);
      trackEvent('page_view', {
        page_url: pathname,
        page_title: document.title,
        referrer_url: document.referrer
      });
    }
  }, []); // Solo en el montaje inicial

  // Track page changes (navegación entre páginas)
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      return;
    }

    // Asegurar que estamos en el cliente antes de hacer tracking
    if (typeof window !== 'undefined') {
      console.log('📍 Cambio de página detectado:', pathname);
      
      trackEvent('page_view', {
        page_url: pathname,
        page_title: document.title,
        referrer_url: document.referrer
      });
    }
  }, [pathname, searchParams, isInitialized]);

  const contextValue = {
    trackContentInteraction: (contentId, contentTitle, interactionType = 'play') => {
      if (typeof window !== 'undefined') {
        console.log('🎵 Tracking interacción con contenido:', { contentId, contentTitle, interactionType });
        
        return trackEvent('content_interaction', {
          content_id: contentId,
          content_title: contentTitle,
          content_type: 'audio',
          interaction_type: interactionType
        });
      }
    },
    trackSocialClick: (platform, url) => {
      if (typeof window !== 'undefined') {
        console.log('📱 Tracking click en red social:', { platform, url });
        
        return trackEvent('social_click', {
          platform,
          url
        });
      }
    },
    trackEvent: (eventType, data) => {
      if (typeof window !== 'undefined') {
        return trackEvent(eventType, data);
      }
    }
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    console.warn('⚠️ useAnalytics usado fuera del AnalyticsProvider');
    return {
      trackPageView: () => console.log('Analytics no disponible'),
      trackContentInteraction: () => console.log('Analytics no disponible'),
      trackSocialClick: () => console.log('Analytics no disponible')
    };
  }
  return context;
};

// Alias para compatibilidad
export const useAnalyticsContext = useAnalytics;