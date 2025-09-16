"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import AnalyticsDashboard from '../../components/AnalyticsDashboard';
import {
  Box,
  Heading,
  Alert,
  AlertIcon,
  Spinner,
  VStack
} from '@chakra-ui/react';
import Swal from "sweetalert2";

export default function EstadisticasPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const checkAccess = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        
        if (!session) {
          await Swal.fire("Sesión requerida", "Inicia sesión para continuar", "info");
          router.replace("/login");
          return;
        }

        if (!mounted) return;
        setUser(session.user);

        // Verificar si es administrador
        const { data: adminCheck, error: adminErr } = await supabase.rpc("is_admin", { 
          uid: session.user.id 
        });
        
        if (adminErr) throw adminErr;
        
        if (!adminCheck) {
          await Swal.fire(
            "Acceso restringido", 
            "Necesitas permisos de administrador para ver las estadísticas", 
            "warning"
          );
          router.replace("/dashboard");
          return;
        }

        if (mounted) {
          setIsAdmin(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error verificando acceso:", error);
        await Swal.fire("Error", "No fue posible verificar los permisos", "error");
        router.replace("/dashboard");
      }
    };

    checkAccess();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (isLoading) {
    return (
      <Box p={6}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Heading size="md">Verificando permisos...</Heading>
        </VStack>
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      <Box p={6}>
        <Alert status="warning">
          <AlertIcon />
          No tienes permisos para acceder a las estadísticas del sitio.
        </Alert>
      </Box>
    );
  }

  return (
    <Box minHeight="100vh" bg="gray.50" _dark={{ bg: "gray.900" }} px={4}>
      <AnalyticsDashboard />
    </Box>
  );
}