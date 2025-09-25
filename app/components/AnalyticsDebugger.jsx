'use client';
import { useEffect, useState } from 'react';

export default function AnalyticsDebugger() {
  const [debugInfo, setDebugInfo] = useState({
    gaLoaded: false,
    gtagFunction: false,
    dataLayer: false,
    gaId: null,
    currentUrl: '',
    userAgent: '',
    cookies: '',
  });

  useEffect(() => {
    const checkAnalytics = () => {
      const info = {
        gaLoaded: typeof window.gtag === 'function',
        gtagFunction: typeof window.gtag === 'function',
        dataLayer: Array.isArray(window.dataLayer),
        gaId: process.env.NEXT_PUBLIC_GA_ID || 'NO CONFIGURADO',
        currentUrl: window.location.href,
        userAgent: navigator.userAgent,
        cookies: document.cookie || 'Sin cookies',
      };
      
      setDebugInfo(info);
      
      // Enviar un evento de prueba
      if (window.gtag) {
        console.log('🔧 Enviando evento de prueba a GA4...');
        window.gtag('event', 'debug_test', {
          custom_parameter: 'test_value',
          timestamp: new Date().toISOString(),
        });
      }
    };

    // Verificar inmediatamente
    checkAnalytics();
    
    // Verificar después de 2 segundos para dar tiempo a que se cargue GA
    const timer = setTimeout(checkAnalytics, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null; // No mostrar en producción
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: '#1a1a1a',
      color: '#white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      maxWidth: '400px',
      zIndex: 9999,
      border: '2px solid #333',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    }}>
      <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#4CAF50' }}>
        🔧 Google Analytics Debug
      </div>
      
      <div style={{ marginBottom: '5px' }}>
        <strong>GA ID:</strong> {debugInfo.gaId}
      </div>
      
      <div style={{ marginBottom: '5px' }}>
        <strong>gtag() cargado:</strong> 
        <span style={{ color: debugInfo.gtagFunction ? '#4CAF50' : '#f44336' }}>
          {debugInfo.gtagFunction ? ' ✅ SÍ' : ' ❌ NO'}
        </span>
      </div>
      
      <div style={{ marginBottom: '5px' }}>
        <strong>dataLayer:</strong> 
        <span style={{ color: debugInfo.dataLayer ? '#4CAF50' : '#f44336' }}>
          {debugInfo.dataLayer ? ' ✅ SÍ' : ' ❌ NO'}
        </span>
      </div>
      
      <div style={{ marginBottom: '5px' }}>
        <strong>URL actual:</strong> {debugInfo.currentUrl}
      </div>
      
      <div style={{ marginBottom: '5px', fontSize: '10px', opacity: 0.7 }}>
        <strong>User Agent:</strong> {debugInfo.userAgent.substring(0, 50)}...
      </div>
      
      <div style={{ fontSize: '10px', opacity: 0.7 }}>
        <strong>Cookies:</strong> {debugInfo.cookies.substring(0, 50)}...
      </div>
      
      <button 
        onClick={() => {
          if (window.gtag) {
            window.gtag('event', 'manual_test', {
              custom_parameter: 'manual_click',
              timestamp: new Date().toISOString(),
            });
            console.log('📊 Evento manual enviado a GA4');
          } else {
            console.error('❌ gtag no está disponible');
          }
        }}
        style={{
          marginTop: '10px',
          padding: '5px 10px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '11px',
        }}
      >
        Enviar Evento Test
      </button>
    </div>
  );
}