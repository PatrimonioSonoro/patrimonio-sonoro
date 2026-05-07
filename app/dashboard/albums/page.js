"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  Box,
  Button,
  Card,
  CardBody,
  HStack,
  Heading,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FiEdit2, FiMusic, FiPlus, FiSearch } from "react-icons/fi";

export default function AlbumsListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");

      try {
        const { data: userRes } = await supabase.auth.getUser();
        const uid = userRes?.user?.id;
        if (!uid) throw new Error("No autorizado");

        const { data: isAdminRes, error: adminErr } = await supabase.rpc("is_admin", { uid });
        if (adminErr || !isAdminRes) {
          setIsAdmin(false);
          throw new Error("No autorizado: se requieren permisos de administrador");
        }
        setIsAdmin(true);

        const { data, error } = await supabase
          .from("albums")
          .select("id, title, created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setItems(data || []);
      } catch (e) {
        setError(e.message || "Error al cargar álbumes");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = items.filter((it) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return String(it?.title || "").toLowerCase().includes(q);
  });

  return (
    <Box maxW="6xl" mx="auto">
      <Card boxShadow="lg" borderRadius="2xl" overflow="hidden">
        <CardBody>
          <HStack justify="space-between" align="start" spacing={6} flexWrap="wrap">
            <HStack spacing={3} minW="240px">
              <Box
                h="44px"
                w="44px"
                borderRadius="2xl"
                bg="blue.50"
                color="blue.700"
                display="grid"
                placeItems="center"
              >
                <Icon as={FiMusic} boxSize={5} />
              </Box>
              <Box>
                <Heading size="md">Álbumes</Heading>
                <Text fontSize="sm" color="gray.600">
                  Administra colecciones musicales, portadas y canciones.
                </Text>
              </Box>
            </HStack>

            <Link href="/dashboard/albums/new">
              <Button colorScheme="blue" leftIcon={<FiPlus />} borderRadius="full">
                Nuevo álbum
              </Button>
            </Link>
          </HStack>

          {!isAdmin && !loading && !error ? (
            <Box mt={6} p={6} borderRadius="2xl" bg="gray.50" borderWidth="1px" borderColor="blackAlpha.100">
              <Text fontWeight="800" color="gray.700">
                No tienes permisos para ver esta sección.
              </Text>
              <Text mt={1} fontSize="sm" color="gray.600">
                Se requieren permisos de administrador.
              </Text>
            </Box>
          ) : (
            <>
              <HStack mt={6} spacing={3} flexWrap="wrap">
                <InputGroup maxW={{ base: "100%", md: "360px" }}>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por título..." />
                </InputGroup>
              </HStack>

              {loading ? (
                <VStack py={10} spacing={3} align="center">
                  <Spinner />
                  <Text fontSize="sm" color="gray.600">
                    Cargando álbumes...
                  </Text>
                </VStack>
              ) : error ? (
                <Box mt={6} p={4} borderRadius="xl" bg="red.50" color="red.700" borderWidth="1px" borderColor="red.100">
                  {error}
                </Box>
              ) : filtered.length === 0 ? (
                <Box mt={6} p={6} borderRadius="2xl" bg="gray.50" borderWidth="1px" borderColor="blackAlpha.100">
                  <Text fontWeight="800" color="gray.700">
                    No hay álbumes para mostrar.
                  </Text>
                  <Text mt={1} fontSize="sm" color="gray.600">
                    Ajusta la búsqueda o crea un nuevo álbum.
                  </Text>
                </Box>
              ) : (
                <TableContainer mt={6} borderRadius="2xl" borderWidth="1px" borderColor="blackAlpha.100">
                  <Table variant="simple" size="md">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Título</Th>
                        <Th>Fecha</Th>
                        <Th textAlign="right">Acciones</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filtered.map((it) => (
                        <Tr key={it.id} _hover={{ bg: "gray.50" }}>
                          <Td>
                            <Text fontWeight="700" color="gray.800">
                              {it.title || "(Sin título)"}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              ID: {String(it.id).slice(0, 8)}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color="gray.700">
                              {it.created_at ? new Date(it.created_at).toLocaleString() : "-"}
                            </Text>
                          </Td>
                          <Td textAlign="right">
                            <Link href={`/dashboard/albums/${it.id}`}>
                              <IconButton
                                aria-label="Ver / editar"
                                icon={<FiEdit2 />}
                                variant="outline"
                                borderRadius="full"
                                size="sm"
                              />
                            </Link>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}
