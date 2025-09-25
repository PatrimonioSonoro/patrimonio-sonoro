// API endpoint para verificar variables de entorno en producción
import { NextResponse } from 'next/server';

export async function GET() {
  const envCheck = {
    NODE_ENV: process.env.NODE_ENV,
    GA_ID_CONFIGURED: !!process.env.NEXT_PUBLIC_GA_ID,
    GA_ID_VALUE: process.env.NEXT_PUBLIC_GA_ID ? 'CONFIGURADO' : 'NO CONFIGURADO',
    SUPABASE_URL_CONFIGURED: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    timestamp: new Date().toISOString(),
  };

  // En producción, no mostrar valores sensibles
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({
      ...envCheck,
      message: '🔒 Verificación de variables de entorno (valores ocultos en producción)'
    });
  }

  // En desarrollo, mostrar valores para debugging
  return NextResponse.json({
    ...envCheck,
    GA_ID_ACTUAL: process.env.NEXT_PUBLIC_GA_ID || 'NO CONFIGURADO',
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NO CONFIGURADO',
    message: '🔧 Verificación de variables de entorno (desarrollo)'
  });
}