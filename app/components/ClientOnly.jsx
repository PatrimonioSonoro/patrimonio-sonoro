"use client";
import { useIsClient } from '../lib/clientHooks';

/**
 * Componente que solo renderiza sus hijos en el cliente
 * Útil para componentes que usan APIs del navegador y causan errores de hidratación
 */
export default function ClientOnly({ children, fallback = null }) {
  const isClient = useIsClient();
  
  if (!isClient) {
    return fallback;
  }
  
  return children;
}
