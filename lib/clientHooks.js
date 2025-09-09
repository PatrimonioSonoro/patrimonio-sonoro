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
