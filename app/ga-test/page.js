'use client';
import { useState, useEffect } from 'react';
import { trackEvent, isGAAvailable, trackPageView } from '../../lib/googleAnalytics';

export default function GATestPage() {
  const [gaStatus, setGaStatus] = useState(false);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    // Verificar GA después de que se cargue la página
    const checkGA = () => {
      const available = isGAAvailable();
      setGaStatus(available);
      
      if (available) {
        addTestResult('✅ Google Analytics está disponible');
        // Enviar page view automático
        trackPageView('/ga-test', 'Página de Prueba GA');
        addTestResult('📊 Page view enviado automáticamente');
      } else {
        addTestResult('❌ Google Analytics NO está disponible');
      }
    };

    // Verificar inmediatamente y después de 2 segundos
    checkGA();
    const timer = setTimeout(checkGA, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const addTestResult = (result) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runTests = [
    {
      name: 'Test Event Simple',
      action: () => {
        trackEvent('test_simple');
        addTestResult('🧪 Evento simple enviado');
      }
    },
    {
      name: 'Test Event con Parámetros',
      action: () => {
        trackEvent('test_with_params', {
          category: 'test',
          label: 'debugging',
          value: 1
        });
        addTestResult('🧪 Evento con parámetros enviado');
      }
    },
    {
      name: 'Test Social Click',
      action: () => {
        trackEvent('social_click', {
          platform: 'test',
          url: 'https://test.com'
        });
        addTestResult('🧪 Social click test enviado');
      }
    },
    {
      name: 'Test Page View Manual',
      action: () => {
        trackPageView('/test-manual', 'Test Manual Page View');
        addTestResult('🧪 Page view manual enviado');
      }
    }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔧 Página de Prueba - Google Analytics</h1>
      
      <div style={{ 
        backgroundColor: gaStatus ? '#d4edda' : '#f8d7da',
        border: `1px solid ${gaStatus ? '#c3e6cb' : '#f5c6cb'}`,
        borderRadius: '5px',
        padding: '15px',
        marginBottom: '20px'
      }}>
        <h2>Estado de Google Analytics</h2>
        <p><strong>Estado:</strong> {gaStatus ? '✅ Activo' : '❌ Inactivo'}</p>
        <p><strong>GA ID:</strong> {process.env.NEXT_PUBLIC_GA_ID || 'NO CONFIGURADO'}</p>
        <p><strong>gtag disponible:</strong> {typeof window !== 'undefined' && window.gtag ? '✅ Sí' : '❌ No'}</p>
        <p><strong>dataLayer disponible:</strong> {typeof window !== 'undefined' && Array.isArray(window.dataLayer) ? '✅ Sí' : '❌ No'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Pruebas de Eventos</h2>
        <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {runTests.map((test, index) => (
            <button
              key={index}
              onClick={test.action}
              style={{
                padding: '10px 15px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {test.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2>Resultados de Pruebas</h2>
        <div style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '5px',
          padding: '15px',
          maxHeight: '300px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '14px'
        }}>
          {testResults.length === 0 ? (
            <p>No hay resultados aún...</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index}>{result}</div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#6c757d' }}>
        <p><strong>Instrucciones:</strong></p>
        <ul>
          <li>1. Abre las herramientas de desarrollador (F12)</li>
          <li>2. Ve a la pestaña Console</li>
          <li>3. Haz clic en los botones de prueba</li>
          <li>4. Verifica los logs en la consola</li>
          <li>5. Ve a Google Analytics → Tiempo Real para ver los eventos</li>
        </ul>
      </div>
    </div>
  );
}