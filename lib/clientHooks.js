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
