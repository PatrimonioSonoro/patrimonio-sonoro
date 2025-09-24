// lib/googleAnalytics.js
// Funciones auxiliares para Google Analytics

// Función para verificar si Google Analytics está disponible
export const isGAAvailable = () => {
  return typeof window !== 'undefined' && window.gtag && process.env.NEXT_PUBLIC_GA_ID;
};

// Función para enviar eventos personalizados a Google Analytics
export const trackEvent = (eventName, parameters = {}) => {
  if (!isGAAvailable()) {
    console.warn('Google Analytics no está disponible');
    return;
  }

  try {
    window.gtag('event', eventName, {
      ...parameters,
      // Agregar timestamp personalizado
      custom_timestamp: new Date().toISOString(),
    });
    console.log(`📈 GA Event: ${eventName}`, parameters);
  } catch (error) {
    console.error('Error enviando evento a Google Analytics:', error);
  }
};

// Función para tracking de páginas
export const trackPageView = (path, title) => {
  if (!isGAAvailable()) return;

  try {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_path: path,
      page_title: title,
    });
    console.log(`📊 GA Page View: ${path}`);
  } catch (error) {
    console.error('Error enviando page view a Google Analytics:', error);
  }
};

// Función específica para tracking de contenido multimedia
export const trackMediaInteraction = (contentId, contentTitle, action, contentType = 'audio') => {
  trackEvent('media_interaction', {
    content_id: contentId,
    content_title: contentTitle,
    content_type: contentType,
    action: action, // 'play', 'pause', 'stop', etc.
  });
};

// Función para tracking de clicks en redes sociales
export const trackSocialClick = (platform, url) => {
  trackEvent('social_click', {
    platform: platform,
    url: url,
    event_category: 'social_media',
    event_label: platform,
  });
};

// Función para tracking de descargas
export const trackDownload = (fileName, fileType) => {
  trackEvent('file_download', {
    file_name: fileName,
    file_type: fileType,
    event_category: 'downloads',
  });
};

// Función para tracking de formularios
export const trackFormSubmission = (formName, success = true) => {
  trackEvent('form_submission', {
    form_name: formName,
    success: success,
    event_category: 'forms',
  });
};

// Función para tracking de búsquedas
export const trackSearch = (searchTerm, resultsCount = null) => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
    event_category: 'search',
  });
};

// Función para tracking de tiempo en página
export const trackTimeOnPage = (pagePath, timeInSeconds) => {
  trackEvent('time_on_page', {
    page_path: pagePath,
    time_seconds: timeInSeconds,
    event_category: 'engagement',
  });
};