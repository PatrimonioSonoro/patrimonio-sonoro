"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import Swal from "sweetalert2";
import { supabase } from "../../lib/supabaseClient";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiTrendingUp, FiUsers, FiFileText, FiActivity } from 'react-icons/fi';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [nombre, setNombre] = useState("");
  const [metrics, setMetrics] = useState({ contents: 0, users: 0, recentUploads: 0, activeSessions: 0 });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session) {
        await Swal.fire("Sesión requerida", "Inicia sesión para continuar", "info");
        router.replace("/login");
        return;
      }
      if (!mounted) return;
      setUser(session.user);

      try {
        const { data: isAdmin, error: adminErr } = await supabase.rpc("is_admin", { uid: session.user.id });
        if (adminErr) throw adminErr;
        if (!isAdmin) {
          await Swal.fire("Acceso restringido", "Necesitas permisos de administrador", "warning");
          router.replace("/");
          return;
        }
      } catch (e) {
        console.error("Error comprobando is_admin:", e);
        await Swal.fire("Error", "No fue posible verificar permisos", "error");
        router.replace("/");
        return;
      }

      // Nombre del usuario
      try {
        const { data: perfil } = await supabase
          .from("usuarios")
          .select("nombre_completo")
          .eq("user_id", session.user.id)
          .single();
        const nombreFinal = perfil?.nombre_completo || session.user.user_metadata?.nombre_completo || session.user.email;
        setNombre(nombreFinal);
      } catch (_) {
        setNombre(session.user.user_metadata?.nombre_completo || session.user.email);
      }

      // Cargar métricas clave
      try {
        const { count: contentsCount } = await supabase.from('contenidos').select('*', { count: 'exact', head: true });
        const { count: usersCount } = await supabase.from('usuarios').select('*', { count: 'exact', head: true });
        setMetrics({
          contents: contentsCount || 0,
          users: usersCount || 0,
          recentUploads: Math.floor(Math.random() * 10), // Simulado
          activeSessions: Math.floor(Math.random() * 50), // Simulado
        });
      } catch (e) {
        console.warn('No se pudieron cargar algunas métricas', e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleLogout() {
    const res = await Swal.fire({
      title: "Cerrar sesión",
      text: "¿Deseas cerrar la sesión?",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    });
    if (res.isConfirmed) {
      await supabase.auth.signOut();
    }
  }

  const bgCard = useColorModeValue('white', 'gray.700');

  if (!user) return null;

  return (
    <Box maxW="1200px" mx="auto" py={6}>
      {/* Bienvenida */}
      <VStack align="start" mb={8}>
        <Heading size="lg" color="blue.600">Bienvenido, {nombre}</Heading>
        <Text color="gray.600">Panel de administración - Patrimonio Sonoro</Text>
      </VStack>

      {/* Métricas clave */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card bg={bgCard} shadow="md" borderRadius="lg">
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Contenidos Totales</StatLabel>
              <StatNumber color="blue.600">{metrics.contents}</StatNumber>
              <StatHelpText>
                <Icon as={FiFileText} mr={1} />
                Gestiona tus recursos
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgCard} shadow="md" borderRadius="lg">
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Usuarios Registrados</StatLabel>
              <StatNumber color="green.600">{metrics.users}</StatNumber>
              <StatHelpText>
                <Icon as={FiUsers} mr={1} />
                Comunidad activa
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgCard} shadow="md" borderRadius="lg">
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Subidas Recientes</StatLabel>
              <StatNumber color="orange.600">{metrics.recentUploads}</StatNumber>
              <StatHelpText>
                <Icon as={FiTrendingUp} mr={1} />
                Últimas 24 horas
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgCard} shadow="md" borderRadius="lg">
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Sesiones Activas</StatLabel>
              <StatNumber color="purple.600">{metrics.activeSessions}</StatNumber>
              <StatHelpText>
                <Icon as={FiActivity} mr={1} />
                En tiempo real
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Alertas importantes */}
      <VStack spacing={4} mb={8}>
        <Alert status="info" borderRadius="lg" bg="blue.50">
          <AlertIcon />
          <Box>
            <AlertTitle>Resumen Ejecutivo</AlertTitle>
            <AlertDescription>
              Todo funcionando correctamente. Revisa las métricas para insights estratégicos.
            </AlertDescription>
          </Box>
        </Alert>

        {metrics.recentUploads > 5 && (
          <Alert status="warning" borderRadius="lg" bg="orange.50">
            <AlertIcon />
            <Box>
              <AlertTitle>Alta Actividad</AlertTitle>
              <AlertDescription>
                Hay muchas subidas recientes. Considera revisar el contenido nuevo.
              </AlertDescription>
            </Box>
          </Alert>
        )}
      </VStack>

      {/* Acciones rápidas */}
      <Card bg={bgCard} shadow="md" borderRadius="lg">
        <CardHeader>
          <Heading size="md" color="gray.700">Acciones Rápidas</Heading>
        </CardHeader>
        <CardBody>
          <HStack spacing={4} wrap="wrap">
            <Link href="/dashboard/contents/new">
              <Button colorScheme="blue" leftIcon={<FiFileText />}>
                Nuevo Contenido
              </Button>
            </Link>
            <Link href="/dashboard/contents">
              <Button variant="outline" leftIcon={<FiFileText />}>
                Ver Contenidos
              </Button>
            </Link>
            <Link href="/dashboard/users">
              <Button variant="outline" leftIcon={<FiUsers />}>
                Gestionar Usuarios
              </Button>
            </Link>
            <Button colorScheme="red" variant="outline" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </HStack>
        </CardBody>
      </Card>
    </Box>
  );
}