'use client';
import Script from 'next/script';

export default function GoogleAnalytics() {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  // Si no hay ID configurado, no renderizar nada
  if (!GA_ID) {
    console.warn('❌ Google Analytics ID no configurado. Agrega NEXT_PUBLIC_GA_ID a tu .env.local');
    return null;
  }

  console.log('🔧 Inicializando Google Analytics con ID:', GA_ID);

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
        onLoad={() => {
          console.log('✅ Script de Google Analytics cargado exitosamente');
        }}
        onError={(e) => {
          console.error('❌ Error cargando script de Google Analytics:', e);
        }}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            console.log('🔧 Configurando Google Analytics...');
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            // Configurar GA4 con debugging
            gtag('config', '${GA_ID}', {
              page_title: document.title,
              page_location: window.location.href,
              debug_mode: ${process.env.NODE_ENV === 'development'}
            });
            
            console.log('✅ Google Analytics configurado con ID: ${GA_ID}');
            console.log('📊 URL actual:', window.location.href);
            console.log('📄 Título actual:', document.title);
            
            // Enviar evento inicial para verificar conectividad
            gtag('event', 'ga4_initialized', {
              timestamp: new Date().toISOString(),
              page_location: window.location.href
            });
          `,
        }}
        onLoad={() => {
          console.log('✅ Configuración de Google Analytics ejecutada');
        }}
      />
    </>
  );
}