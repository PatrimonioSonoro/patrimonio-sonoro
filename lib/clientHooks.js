import { useEffect, useState } from 'react';

/**
 * Hook para detectar si estamos en el cliente (después de la hidratación)
 * Previene errores de hidratación al usar APIs del navegador
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Hook para obtener URLs firmadas de archivos de Supabase Storage
 * @param {string[]} paths - Array de rutas de archivos
 * @param {number} expires - Tiempo de expiración en segundos (default: 1 hora)
 */
export function useSignedUrls(paths, expires = 3600) {
  const [urls, setUrls] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!paths || paths.length === 0) return;

    const pathsString = JSON.stringify(paths);
    
    const fetchUrls = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/public/signed-urls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths, expires })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setUrls(data.urls || {});
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch signed URLs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUrls();
  }, [paths, expires]);

  return { urls, loading, error };
}

/**
 * Hook para uso seguro de localStorage con SSR
 * @param {string} key - La clave de localStorage
 * @param {any} defaultValue - Valor por defecto
 * @returns {[any, function]} - [value, setValue]
 */
export function useLocalStorage(key, defaultValue) {
  const isClient = useIsClient();
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (!isClient) return;
    
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  }, [key, isClient]);

  const setStoredValue = (newValue) => {
    try {
      setValue(newValue);
      if (isClient) {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [value, setStoredValue];
}

/**
 * Wrapper para uso seguro de APIs del navegador
 * @param {function} fn - Función que usa APIs del navegador
 * @param {any} fallback - Valor de fallback si no estamos en el cliente
 */
export function useClientOnly(fn, fallback = null) {
  const isClient = useIsClient();
  
  if (!isClient) return fallback;
  
  try {
    return fn();
  } catch (error) {
    console.warn('Error in client-only function:', error);
    return fallback;
  }
}
