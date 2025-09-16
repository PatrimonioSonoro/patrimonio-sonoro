"use client";
import { 
  Box, 
  SimpleGrid, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText,
  Heading,
  Card,
  CardBody,
  Text,
  VStack,
  HStack,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer
} from '@chakra-ui/react';
import { FiUsers, FiEye, FiPlay, FiMousePointer } from 'react-icons/fi';
import { useAnalyticsDashboard, useRealtimeAnalytics } from '../../lib/analyticsSimple';
import { useState } from 'react';

const StatCard = ({ title, value, icon: Icon, helpText, color = "blue" }) => (
  <Card>
    <CardBody>
      <Stat>
        <StatLabel fontSize="sm" color="gray.600">
          <HStack spacing={2}>
            <Icon color={`${color}.500`} />
            <Text>{title}</Text>
          </HStack>
        </StatLabel>
        <StatNumber fontSize="2xl" color={`${color}.600`}>
          {value || 0}
        </StatNumber>
        {helpText && (
          <StatHelpText fontSize="xs">{helpText}</StatHelpText>
        )}
      </Stat>
    </CardBody>
  </Card>
);

export default function AnalyticsDashboard() {
  const { stats, loading, error, refetch } = useAnalyticsDashboard();
  const [recentEvents, setRecentEvents] = useState([]);

  // Actualizaciones en tiempo real
  useRealtimeAnalytics((payload) => {
    console.log('📊 Evento en tiempo real recibido:', payload);
    
    if (payload.eventType === 'INSERT') {
      refetch();
      
      setRecentEvents(prev => [{
        id: payload.new.id,
        type: payload.table === 'page_views' ? 'Vista de página' : 
              payload.table === 'content_interactions' ? 'Reproducción' :
              payload.table === 'social_media_clicks' ? 'Click en red social' : 'Evento',
        timestamp: new Date(payload.new.created_at || payload.new.viewed_at || payload.new.interacted_at || payload.new.clicked_at),
        details: payload.new
      }, ...prev.slice(0, 9)]);
    }
  });

  if (error) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error cargando estadísticas:</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2} color="blue.700">
            📊 Analytics Dashboard
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Estadísticas en tiempo real de tu sitio web
          </Text>
        </Box>

        {/* Estadísticas principales */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          {loading ? (
            <>
              {[1,2,3,4].map(i => (
                <Box key={i} height="120px" bg="gray.100" borderRadius="md" />
              ))}
            </>
          ) : (
            <>
              <StatCard 
                title="Usuarios Únicos" 
                value={stats?.uniqueUsers} 
                icon={FiUsers}
                helpText="Total de visitantes únicos"
                color="blue"
              />
              <StatCard 
                title="Vistas de Página" 
                value={stats?.pageViews} 
                icon={FiEye}
                helpText="Páginas visitadas"
                color="green"
              />
              <StatCard 
                title="Reproducciones" 
                value={stats?.contentInteractions} 
                icon={FiPlay}
                helpText="Contenido reproducido"
                color="purple"
              />
              <StatCard 
                title="Clicks en Redes" 
                value={stats?.socialClicks} 
                icon={FiMousePointer}
                helpText="Enlaces a redes sociales"
                color="orange"
              />
            </>
          )}
        </SimpleGrid>

        {/* Estadísticas por página */}
        {!loading && stats?.pageStats && stats.pageStats.length > 0 && (
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>📄 Páginas más visitadas</Heading>
              <TableContainer>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Página</Th>
                      <Th isNumeric>Visitas</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {stats.pageStats.map((page, index) => (
                      <Tr key={index}>
                        <Td>
                          <Badge colorScheme="blue" variant="subtle">
                            {page.page_path === '/' ? 'Página Principal' : page.page_path}
                          </Badge>
                        </Td>
                        <Td isNumeric fontWeight="bold">{page.views}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </CardBody>
          </Card>
        )}

        {/* Eventos recientes */}
        {recentEvents.length > 0 && (
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>⚡ Actividad Reciente</Heading>
              <VStack spacing={2} align="stretch">
                {recentEvents.map((event) => (
                  <Box 
                    key={event.id}
                    p={3}
                    bg="gray.50"
                    borderRadius="md"
                    borderLeft="4px solid"
                    borderLeftColor="blue.400"
                  >
                    <HStack justify="space-between">
                      <HStack spacing={2}>
                        <Badge colorScheme="blue">{event.type}</Badge>
                        <Text fontSize="sm">
                          {event.details.page_url || event.details.content_title || event.details.platform || 'Actividad'}
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        {event.timestamp.toLocaleTimeString()}
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Mensaje si no hay datos */}
        {!loading && (!stats || (stats.uniqueUsers === 0 && stats.pageViews === 0)) && (
          <Alert status="info">
            <AlertIcon />
            <AlertTitle>No hay datos aún</AlertTitle>
            <AlertDescription>
              Visita la página principal o interactúa con el contenido para generar estadísticas.
            </AlertDescription>
          </Alert>
        )}
      </VStack>
    </Box>
  );
}