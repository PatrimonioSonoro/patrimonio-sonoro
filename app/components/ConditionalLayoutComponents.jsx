"use client";
import { usePathname } from 'next/navigation';
import SocialFloat from './SocialFloat';
import Footer from './Footer';

export default function ConditionalLayoutComponents({ socialLinks }) {
  const pathname = usePathname();
  
  // Detectar si estamos en rutas del dashboard/administración
  const isDashboard = pathname?.startsWith('/dashboard');
  const isPrivateApp = pathname?.startsWith('/app');
  
  // No mostrar footer ni redes sociales en el panel administrativo ni en el área privada
  if (isDashboard || isPrivateApp) {
    return null;
  }
  
  return (
    <>
      <SocialFloat links={socialLinks} />
      <Footer />
    </>
  );
}