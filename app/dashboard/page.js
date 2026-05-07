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
  Flex,
  Button,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Divider,
  Icon,
  Wrap,
  WrapItem,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiTrendingUp, FiUsers, FiFileText, FiActivity } from 'react-icons/fi';

function MetricCard({
  bg,
  borderColor,
  label,
  value,
  help,
  icon,
  iconBg,
  iconColor,
  valueColor,
  isLoading,
  children,
}) {
  return (
    <Card bg={bg} shadow="md" borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
      <CardBody>
        <Stat>
          <HStack justify="space-between" mb={2}>
            <StatLabel color="gray.600">{label}</StatLabel>
            <Box
              h="10"
              w="10"
              borderRadius="xl"
              bg={iconBg}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={icon} color={iconColor} />
            </Box>
          </HStack>
          <Skeleton isLoaded={!isLoading} borderRadius="lg">
            <StatNumber color={valueColor} fontSize="3xl">
              {value}
            </StatNumber>
          </Skeleton>
          {help ? <StatHelpText>{help}</StatHelpText> : null}
          {children}
        </Stat>
      </CardBody>
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [nombre, setNombre] = useState("");
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [metrics, setMetrics] = useState({
    contentsTotal: 0,
    contentsPublished: 0,
    contentsDraft: 0,
    recentUploads24h: 0,
    usersTotal: 0,
    usersActive: 0,
    usersInactive: 0,
    adminsTotal: 0,
    albumsTotal: 0,
    songsTotal: 0,
    mapaSonoroTotal: 0,
    mapaSonoroFeatured: 0,
    activeSessions: 1,
  });

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
        setLoadingMetrics(true);
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const [
          contentsTotalRes,
          contentsPublishedRes,
          contentsDraftRes,
          recentUploads24hRes,
          usersTotalRes,
          usersActiveRes,
          usersInactiveRes,
          adminsTotalRes,
          albumsTotalRes,
          songsTotalRes,
          mapaSonoroTotalRes,
          mapaSonoroFeaturedRes,
        ] = await Promise.all([
          supabase.from("contenidos").select("id", { count: "exact", head: true }),
          supabase.from("contenidos").select("id", { count: "exact", head: true }).eq("status", "published"),
          supabase.from("contenidos").select("id", { count: "exact", head: true }).eq("status", "draft"),
          supabase.from("contenidos").select("id", { count: "exact", head: true }).gte("created_at", since),
          supabase.from("usuarios").select("user_id", { count: "exact", head: true }),
          supabase.from("usuarios").select("user_id", { count: "exact", head: true }).eq("is_active", true),
          supabase.from("usuarios").select("user_id", { count: "exact", head: true }).eq("is_active", false),
          supabase.from("usuarios").select("user_id", { count: "exact", head: true }).eq("role", "admin"),
          supabase.from("albums").select("id", { count: "exact", head: true }),
          supabase.from("songs").select("id", { count: "exact", head: true }),
          supabase.from("mapa_sonoro").select("id", { count: "exact", head: true }),
          supabase.from("mapa_sonoro").select("id", { count: "exact", head: true }).eq("es_destacado", true),
        ]);

        setMetrics({
          contentsTotal: contentsTotalRes?.count || 0,
          contentsPublished: contentsPublishedRes?.count || 0,
          contentsDraft: contentsDraftRes?.count || 0,
          recentUploads24h: recentUploads24hRes?.count || 0,
          usersTotal: usersTotalRes?.count || 0,
          usersActive: usersActiveRes?.count || 0,
          usersInactive: usersInactiveRes?.count || 0,
          adminsTotal: adminsTotalRes?.count || 0,
          albumsTotal: albumsTotalRes?.count || 0,
          songsTotal: songsTotalRes?.count || 0,
          mapaSonoroTotal: mapaSonoroTotalRes?.count || 0,
          mapaSonoroFeatured: mapaSonoroFeaturedRes?.count || 0,
          activeSessions: 1,
        });
      } catch (e) {
        console.warn('No se pudieron cargar algunas métricas', e);
      } finally {
        setLoadingMetrics(false);
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
  const bgPage = useColorModeValue('gray.50', 'gray.900');
  const heroBg = useColorModeValue('linear-gradient(135deg, rgba(0,45,98,1) 0%, rgba(0,184,169,0.92) 100%)', 'linear-gradient(135deg, rgba(0,45,98,1) 0%, rgba(0,184,169,0.78) 100%)');
  const subtleBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.200');
  const alertBg = useColorModeValue("blue.50", "whiteAlpha.100");
  const alertBorder = useColorModeValue("blue.100", "whiteAlpha.200");
  const quickActionsTitle = useColorModeValue("gray.700", "whiteAlpha.900");
  const sectionTitle = useColorModeValue("gray.800", "whiteAlpha.900");
  const sectionMuted = useColorModeValue("gray.600", "whiteAlpha.700");
  const progressTrackBg = useColorModeValue("blackAlpha.100", "whiteAlpha.200");
  const draftIconBg = useColorModeValue("gray.100", "whiteAlpha.200");
  const draftIconColor = useColorModeValue("gray.700", "whiteAlpha.800");
  const draftValueColor = useColorModeValue("gray.800", "whiteAlpha.900");

  const contentsPct = metrics.contentsTotal > 0 ? Math.round((metrics.contentsPublished / metrics.contentsTotal) * 100) : 0;
  const usersActivePct = metrics.usersTotal > 0 ? Math.round((metrics.usersActive / metrics.usersTotal) * 100) : 0;
  const featuredPct = metrics.mapaSonoroTotal > 0 ? Math.round((metrics.mapaSonoroFeatured / metrics.mapaSonoroTotal) * 100) : 0;

  if (!user) return null;

  return (
    <Box minHeight="100vh" bg={bgPage}>
      <Box maxW="1200px" mx="auto" py={6} px={4}>
        <Card
          bg={heroBg}
          borderRadius="2xl"
          overflow="hidden"
          borderWidth="1px"
          borderColor="whiteAlpha.200"
          shadow="xl"
        >
          <CardBody>
            <VStack align="start" spacing={2}>
              <Text fontSize="xs" fontWeight="800" letterSpacing="0.12em" color="whiteAlpha.800">
                ADMINISTRACIÓN
              </Text>
              <Heading size={{ base: "md", md: "lg" }} color="white">
                Bienvenido, {nombre}
              </Heading>
              <Text color="whiteAlpha.800" fontSize={{ base: "sm", md: "md" }}>
                Panel de administración - Patrimonio Sonoro
              </Text>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={bgCard} borderRadius="2xl" borderWidth="1px" borderColor={subtleBorder} shadow="sm" mt={8}>
          <CardHeader pb={4}>
            <Flex align="start" justify="space-between" gap={4} flexWrap="wrap">
              <Box>
                <Heading size="md" color={sectionTitle}>Visión general</Heading>
                <Text fontSize="sm" color={sectionMuted} mt={1}>
                  Totales del sistema y actividad reciente.
                </Text>
              </Box>
              <Box minW={{ base: "full", md: "320px" }}>
                <Text fontSize="xs" fontWeight="700" color={sectionMuted} mb={2}>
                  Publicación de contenidos ({contentsPct}%)
                </Text>
                <Progress
                  value={contentsPct}
                  colorScheme="blue"
                  borderRadius="full"
                  bg={progressTrackBg}
                />
              </Box>
            </Flex>
          </CardHeader>
          <CardBody pt={0}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              <MetricCard
                bg={bgCard}
                borderColor={subtleBorder}
                label="Contenidos Totales"
                value={metrics.contentsTotal}
                help="Gestiona tus recursos"
                icon={FiFileText}
                iconBg="blue.50"
                iconColor="blue.600"
                valueColor="blue.700"
                isLoading={loadingMetrics}
              />

              <MetricCard
                bg={bgCard}
                borderColor={subtleBorder}
                label="Usuarios Registrados"
                value={metrics.usersTotal}
                help="Comunidad activa"
                icon={FiUsers}
                iconBg="green.50"
                iconColor="green.600"
                valueColor="green.700"
                isLoading={loadingMetrics}
              >
                <Box mt={2}>
                  <Text fontSize="xs" fontWeight="700" color={sectionMuted} mb={2}>
                    Usuarios activos ({usersActivePct}%)
                  </Text>
                  <Progress
                    value={usersActivePct}
                    colorScheme="green"
                    borderRadius="full"
                    bg={progressTrackBg}
                  />
                </Box>
              </MetricCard>

              <MetricCard
                bg={bgCard}
                borderColor={subtleBorder}
                label="Subidas Recientes"
                value={metrics.recentUploads24h}
                help="Últimas 24 horas"
                icon={FiTrendingUp}
                iconBg="orange.50"
                iconColor="orange.600"
                valueColor="orange.700"
                isLoading={loadingMetrics}
              />

              <MetricCard
                bg={bgCard}
                borderColor={subtleBorder}
                label="Sesiones Activas"
                value={metrics.activeSessions}
                help="En tiempo real"
                icon={FiActivity}
                iconBg="purple.50"
                iconColor="purple.600"
                valueColor="purple.700"
                isLoading={false}
              />
            </SimpleGrid>
          </CardBody>
        </Card>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} my={6}>
          <Card bg={bgCard} borderRadius="2xl" borderWidth="1px" borderColor={subtleBorder} shadow="sm">
            <CardHeader pb={3}>
              <HStack justify="space-between">
                <HStack spacing={3}>
                  <Box h="10" w="10" borderRadius="xl" bg="blue.50" display="flex" alignItems="center" justifyContent="center">
                    <Icon as={FiFileText} color="blue.600" />
                  </Box>
                  <Box>
                    <Heading size="sm" color={sectionTitle}>Contenidos</Heading>
                    <Text fontSize="sm" color={sectionMuted}>Estado editorial</Text>
                  </Box>
                </HStack>
              </HStack>
            </CardHeader>
            <Divider borderColor={subtleBorder} />
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <MetricCard
                  bg={bgCard}
                  borderColor={subtleBorder}
                  label="Publicados"
                  value={metrics.contentsPublished}
                  help="Contenidos visibles"
                  icon={FiFileText}
                  iconBg="blue.50"
                  iconColor="blue.600"
                  valueColor="blue.700"
                  isLoading={loadingMetrics}
                />
                <MetricCard
                  bg={bgCard}
                  borderColor={subtleBorder}
                  label="Borradores"
                  value={metrics.contentsDraft}
                  help="Pendientes de publicar"
                  icon={FiFileText}
                  iconBg={draftIconBg}
                  iconColor={draftIconColor}
                  valueColor={draftValueColor}
                  isLoading={loadingMetrics}
                />
              </SimpleGrid>
            </CardBody>
          </Card>

          <Card bg={bgCard} borderRadius="2xl" borderWidth="1px" borderColor={subtleBorder} shadow="sm">
            <CardHeader pb={3}>
              <HStack spacing={3}>
                <Box h="10" w="10" borderRadius="xl" bg="green.50" display="flex" alignItems="center" justifyContent="center">
                  <Icon as={FiUsers} color="green.600" />
                </Box>
                <Box>
                  <Heading size="sm" color={sectionTitle}>Usuarios</Heading>
                  <Text fontSize="sm" color={sectionMuted}>Actividad y roles</Text>
                </Box>
              </HStack>
            </CardHeader>
            <Divider borderColor={subtleBorder} />
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <MetricCard
                  bg={bgCard}
                  borderColor={subtleBorder}
                  label="Activos"
                  value={metrics.usersActive}
                  help={`${metrics.usersInactive} inactivos`}
                  icon={FiUsers}
                  iconBg="green.50"
                  iconColor="green.600"
                  valueColor="green.700"
                  isLoading={loadingMetrics}
                />
                <MetricCard
                  bg={bgCard}
                  borderColor={subtleBorder}
                  label="Administradores"
                  value={metrics.adminsTotal}
                  help="Usuarios con permisos"
                  icon={FiUsers}
                  iconBg="purple.50"
                  iconColor="purple.600"
                  valueColor="purple.700"
                  isLoading={loadingMetrics}
                />
              </SimpleGrid>
            </CardBody>
          </Card>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
          <Card bg={bgCard} borderRadius="2xl" borderWidth="1px" borderColor={subtleBorder} shadow="sm">
            <CardHeader pb={3}>
              <HStack spacing={3}>
                <Box h="10" w="10" borderRadius="xl" bg="purple.50" display="flex" alignItems="center" justifyContent="center">
                  <Icon as={FiActivity} color="purple.600" />
                </Box>
                <Box>
                  <Heading size="sm" color={sectionTitle}>Álbumes</Heading>
                  <Text fontSize="sm" color={sectionMuted}>Catálogo musical</Text>
                </Box>
              </HStack>
            </CardHeader>
            <Divider borderColor={subtleBorder} />
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <MetricCard
                  bg={bgCard}
                  borderColor={subtleBorder}
                  label="Álbumes"
                  value={metrics.albumsTotal}
                  help="Colecciones creadas"
                  icon={FiActivity}
                  iconBg="purple.50"
                  iconColor="purple.600"
                  valueColor="purple.700"
                  isLoading={loadingMetrics}
                />
                <MetricCard
                  bg={bgCard}
                  borderColor={subtleBorder}
                  label="Canciones"
                  value={metrics.songsTotal}
                  help="Pistas registradas"
                  icon={FiActivity}
                  iconBg="purple.50"
                  iconColor="purple.600"
                  valueColor="purple.700"
                  isLoading={loadingMetrics}
                />
              </SimpleGrid>
            </CardBody>
          </Card>

          <Card bg={bgCard} borderRadius="2xl" borderWidth="1px" borderColor={subtleBorder} shadow="sm">
            <CardHeader pb={3}>
              <Flex align="start" justify="space-between" gap={4} flexWrap="wrap">
                <HStack spacing={3}>
                  <Box h="10" w="10" borderRadius="xl" bg="teal.50" display="flex" alignItems="center" justifyContent="center">
                    <Icon as={FiActivity} color="teal.600" />
                  </Box>
                  <Box>
                    <Heading size="sm" color={sectionTitle}>Mapa Sonoro</Heading>
                    <Text fontSize="sm" color={sectionMuted}>Cobertura y destacados</Text>
                  </Box>
                </HStack>
                <Box minW={{ base: "full", md: "260px" }}>
                  <Text fontSize="xs" fontWeight="700" color={sectionMuted} mb={2}>
                    Audios destacados ({featuredPct}%)
                  </Text>
                  <Progress
                    value={featuredPct}
                    colorScheme="yellow"
                    borderRadius="full"
                    bg={progressTrackBg}
                  />
                </Box>
              </Flex>
            </CardHeader>
            <Divider borderColor={subtleBorder} />
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <MetricCard
                  bg={bgCard}
                  borderColor={subtleBorder}
                  label="Audios"
                  value={metrics.mapaSonoroTotal}
                  help="Audios cargados"
                  icon={FiActivity}
                  iconBg="teal.50"
                  iconColor="teal.600"
                  valueColor="teal.700"
                  isLoading={loadingMetrics}
                />
                <MetricCard
                  bg={bgCard}
                  borderColor={subtleBorder}
                  label="Destacados"
                  value={metrics.mapaSonoroFeatured}
                  help="Audios destacados"
                  icon={FiTrendingUp}
                  iconBg="yellow.50"
                  iconColor="yellow.700"
                  valueColor="yellow.700"
                  isLoading={loadingMetrics}
                />
              </SimpleGrid>
            </CardBody>
          </Card>
        </SimpleGrid>

      {/* Alertas importantes */}
        <VStack spacing={4} mb={8}>
        <Alert status="info" borderRadius="xl" bg={alertBg} borderWidth="1px" borderColor={alertBorder}>
          <AlertIcon />
          <Box>
            <AlertTitle>Resumen Ejecutivo</AlertTitle>
            <AlertDescription>
              Revisa estas métricas para entender el crecimiento de usuarios, contenidos, álbumes y Mapa Sonoro.
            </AlertDescription>
          </Box>
        </Alert>
      </VStack>

      {/* Acciones rápidas */}
        <Card bg={bgCard} shadow="md" borderRadius="xl" borderWidth="1px" borderColor={subtleBorder}>
        <CardHeader pb={0}>
          <Heading size="md" color={quickActionsTitle}>Acciones Rápidas</Heading>
        </CardHeader>
        <CardBody>
          <Wrap spacing={3}>
            <WrapItem>
              <Link href="/dashboard/contents/new">
                <Button colorScheme="blue" leftIcon={<FiFileText />} borderRadius="full">
                  Nuevo Contenido
                </Button>
              </Link>
            </WrapItem>
            <WrapItem>
              <Link href="/dashboard/contents">
                <Button variant="outline" leftIcon={<FiFileText />} borderRadius="full">
                  Ver Contenidos
                </Button>
              </Link>
            </WrapItem>
            <WrapItem>
              <Link href="/dashboard/users">
                <Button variant="outline" leftIcon={<FiUsers />} borderRadius="full">
                  Gestionar Usuarios
                </Button>
              </Link>
            </WrapItem>
            <WrapItem>
              <Button colorScheme="red" variant="outline" onClick={handleLogout} borderRadius="full">
                Cerrar Sesión
              </Button>
            </WrapItem>
          </Wrap>
        </CardBody>
      </Card>
      </Box>
    </Box>
  );
}