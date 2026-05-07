"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  FormHelperText,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
  Switch,
  VStack,
} from "@chakra-ui/react";
import { FiEdit2, FiMusic, FiPlus, FiSave, FiSearch, FiTrash2, FiUpload, FiX } from "react-icons/fi";
import { supabase } from "../../../lib/supabaseClient";

const REGIONS = ["Amazonía", "Andina", "Caribe", "Insular", "Pacífico", "Orinoquia"];

function formatDate(ts) {
  if (!ts) return "-";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "-";
  }
}

function toNumberSafe(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : NaN;
  const raw = String(v ?? "").trim();
  if (!raw) return NaN;
  const normalized = raw.replace(/\s+/g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}

function isValidLatLng(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  return true;
}

export default function AdminMapaSonoroPage() {
  const toast = useToast();

  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterRegion, setFilterRegion] = useState("");
  const [query, setQuery] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    titulo: "",
    region: "",
    lat: "",
    lng: "",
    es_destacado: false,
  });
  const [audioFile, setAudioFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setForm({ titulo: "", region: "", lat: "", lng: "", es_destacado: false });
    setAudioFile(null);
  };

  const loadItems = async ({ region = filterRegion, q = query } = {}) => {
    setLoading(true);
    setError("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("No autorizado");

      const params = new URLSearchParams();
      if (region) params.set("region", region);
      if (q) params.set("q", q);

      const res = await fetch(`/api/admin/mapa-sonoro?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No se pudo cargar");

      setItems(Array.isArray(json?.items) ? json.items : []);
    } catch (e) {
      setError(e?.message || "Error cargando Mapa Sonoro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      setChecking(true);
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
        await loadItems({ region: "", q: "" });
      } catch (e) {
        setError(e?.message || "No autorizado");
      } finally {
        setChecking(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("No autorizado");

      const titulo = String(form.titulo || "").trim();
      const region = String(form.region || "").trim();
      const lat = toNumberSafe(form.lat);
      const lng = toNumberSafe(form.lng);

      if (!titulo) throw new Error("El título es obligatorio");
      if (!region) throw new Error("La región es obligatoria");
      if (!isValidLatLng(lat, lng)) throw new Error("Latitud/Longitud inválidas");

      if (!editingId && !audioFile) throw new Error("Debes subir un archivo de audio");

      const fd = new FormData();
      if (editingId) fd.set("id", editingId);
      fd.set("titulo", titulo);
      fd.set("region", region);
      fd.set("lat", String(lat));
      fd.set("lng", String(lng));
      fd.set("es_destacado", form.es_destacado ? "1" : "0");
      if (audioFile) fd.append("audio", audioFile, audioFile.name);

      const res = await fetch("/api/admin/mapa-sonoro", {
        method: editingId ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const json = await res.json();
      if (!res.ok) {
        const msg = json?.error || "No se pudo guardar";
        throw new Error(msg);
      }

      toast({
        title: editingId ? "Audio actualizado" : "Audio creado",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      resetForm();
      await loadItems();
    } catch (e) {
      setError(e?.message || "Error guardando");
      toast({
        title: "Error",
        description: e?.message || "Error guardando",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("No autorizado");

      const res = await fetch(`/api/admin/mapa-sonoro?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No se pudo eliminar");

      toast({ title: "Eliminado", status: "success", duration: 2500, isClosable: true });
      await loadItems();
    } catch (e) {
      toast({
        title: "Error",
        description: e?.message || "No se pudo eliminar",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    }
  };

  const featuredByRegion = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      if (it.es_destacado) map.set(it.region, it.id);
    }
    return map;
  }, [items]);

  return (
    <Box maxW="6xl" mx="auto">
      <Card boxShadow="lg" borderRadius="2xl" overflow="hidden">
        <CardHeader pb={0}>
          <Flex align="start" justify="space-between" mb={0} gap={4} wrap="wrap">
            <HStack spacing={3} minW="260px">
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
                <Heading size="md">Mapa Sonoro</Heading>
                <Text fontSize="sm" color="gray.600">
                  Administra audios por región (solo 1 destacado por región).
                </Text>
              </Box>
            </HStack>

            <Button leftIcon={<FiPlus />} onClick={resetForm} variant="outline" borderRadius="full">
              Nuevo
            </Button>
          </Flex>
        </CardHeader>

        <CardBody>
          {checking ? (
            <VStack py={8} spacing={3} align="center">
              <Spinner />
              <Text fontSize="sm" color="gray.600">
                Verificando permisos...
              </Text>
            </VStack>
          ) : null}

          {error ? (
            <Box mb={6} p={4} borderRadius="xl" bg="red.50" color="red.700" borderWidth="1px" borderColor="red.100">
              {error}
            </Box>
          ) : null}

          {!checking && !isAdmin ? (
            <Box p={6} borderRadius="2xl" bg="gray.50" borderWidth="1px" borderColor="blackAlpha.100">
              <Text fontWeight="800" color="gray.700">
                No tienes permisos para ver esta sección.
              </Text>
              <Text mt={1} fontSize="sm" color="gray.600">
                Se requieren permisos de administrador.
              </Text>
            </Box>
          ) : null}

          {!checking && isAdmin ? (
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} alignItems="start">
              <Card variant="outline" borderRadius="2xl" overflow="hidden">
                <CardHeader>
                  <Flex align="center" justify="space-between" gap={3} wrap="wrap">
                    <Box>
                      <Heading size="sm">{editingId ? "Editar audio" : "Subir audio"}</Heading>
                      <Text mt={1} fontSize="sm" color="gray.600">
                        Define región, coordenadas y archivo de audio.
                      </Text>
                    </Box>
                    {editingId ? (
                      <HStack spacing={2}>
                        <Badge colorScheme="purple">Editando</Badge>
                        <IconButton
                          aria-label="Cancelar"
                          icon={<Icon as={FiX} />}
                          size="sm"
                          variant="ghost"
                          onClick={resetForm}
                          borderRadius="full"
                        />
                      </HStack>
                    ) : null}
                  </Flex>
                </CardHeader>
                <Divider />
                <CardBody>
                  <Box as="form" onSubmit={onSubmit}>
                    <Stack spacing={4}>
                      <FormControl>
                        <FormLabel>Título del sonido</FormLabel>
                        <Input
                          value={form.titulo}
                          onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                          placeholder="Ej: Cantos del Pacífico"
                        />
                      </FormControl>

                      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                        <FormControl>
                          <FormLabel>Región</FormLabel>
                          <Select
                            value={form.region}
                            onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                            placeholder="Selecciona"
                          >
                            {REGIONS.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl>
                          <FormLabel>Audio (archivo)</FormLabel>
                          <Input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
                          {editingId ? (
                            <FormHelperText>Opcional: si subes un nuevo audio, reemplaza la URL.</FormHelperText>
                          ) : (
                            <FormHelperText>Formatos recomendados: MP3 / WAV.</FormHelperText>
                          )}
                        </FormControl>

                        <FormControl>
                          <FormLabel>Latitud</FormLabel>
                          <Input
                            value={form.lat}
                            onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                            placeholder="Ej: 3.4516"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Longitud</FormLabel>
                          <Input
                            value={form.lng}
                            onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
                            placeholder="Ej: -76.5320"
                          />
                        </FormControl>
                      </SimpleGrid>

                      <HStack justify="space-between" align="center" borderWidth="1px" borderColor="blackAlpha.100" bg="gray.50" p={3} borderRadius="xl">
                        <Box>
                          <Text fontWeight="700" color="gray.800">
                            Audio destacado
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            Solo uno por región.
                          </Text>
                        </Box>
                        <Switch
                          isChecked={form.es_destacado}
                          onChange={(e) => setForm((f) => ({ ...f, es_destacado: e.target.checked }))}
                          colorScheme="blue"
                        />
                      </HStack>

                      <Button
                        type="submit"
                        leftIcon={editingId ? <FiSave /> : <FiUpload />}
                        colorScheme="blue"
                        isLoading={saving}
                        loadingText={editingId ? "Guardando..." : "Subiendo..."}
                        size="lg"
                        borderRadius="full"
                      >
                        {editingId ? "Guardar cambios" : "Crear audio"}
                      </Button>
                    </Stack>
                  </Box>
                </CardBody>
              </Card>

              <Card variant="outline" borderRadius="2xl" overflow="hidden">
                <CardHeader>
                  <Flex align="center" justify="space-between" gap={3} wrap="wrap">
                    <Box>
                      <Heading size="sm">Listado</Heading>
                      <Text mt={1} fontSize="sm" color="gray.600">
                        Filtra por región o busca por título.
                      </Text>
                    </Box>
                    <HStack spacing={2} flexWrap="wrap" justify="flex-end">
                      <Select
                        value={filterRegion}
                        onChange={(e) => setFilterRegion(e.target.value)}
                        placeholder="Todas"
                        size="sm"
                        w={{ base: "170px", md: "200px" }}
                      >
                        {REGIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </Select>
                      <InputGroup size="sm" w={{ base: "220px", md: "260px" }}>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiSearch} color="gray.400" />
                        </InputLeftElement>
                        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar..." />
                      </InputGroup>
                      <Button size="sm" onClick={() => loadItems({ region: filterRegion, q: query })}>
                        Filtrar
                      </Button>
                    </HStack>
                  </Flex>
                </CardHeader>
                <Divider />
                <CardBody>
                  {loading ? (
                    <VStack py={8} spacing={3} align="center">
                      <Spinner />
                      <Text fontSize="sm" color="gray.600">
                        Cargando audios...
                      </Text>
                    </VStack>
                  ) : !items.length ? (
                    <Box p={6} borderRadius="2xl" bg="gray.50" borderWidth="1px" borderColor="blackAlpha.100">
                      <Text fontWeight="800" color="gray.700">
                        No hay audios aún.
                      </Text>
                      <Text mt={1} fontSize="sm" color="gray.600">
                        Crea el primer audio o ajusta los filtros.
                      </Text>
                    </Box>
                  ) : (
                    <TableContainer borderRadius="2xl" borderWidth="1px" borderColor="blackAlpha.100">
                      <Table size="sm" variant="simple">
                        <Thead bg="gray.50">
                          <Tr>
                            <Th>Región</Th>
                            <Th>Título</Th>
                            <Th>Destacado</Th>
                            <Th>Creado</Th>
                            <Th textAlign="right">Acciones</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {items.map((it) => (
                            <Tr key={it.id} _hover={{ bg: "gray.50" }}>
                              <Td>
                                <Badge colorScheme="teal">{it.region}</Badge>
                              </Td>
                              <Td>
                                <Text fontWeight="700" noOfLines={1} color="gray.800">
                                  {it.titulo}
                                </Text>
                                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                  {Number(it.lat).toFixed(4)}, {Number(it.lng).toFixed(4)}
                                </Text>
                              </Td>
                              <Td>
                                {it.es_destacado ? (
                                  <Badge colorScheme="yellow">Sí</Badge>
                                ) : featuredByRegion.get(it.region) ? (
                                  <Badge colorScheme="gray">No</Badge>
                                ) : (
                                  <Badge colorScheme="red">Sin destacado</Badge>
                                )}
                              </Td>
                              <Td>
                                <Text fontSize="xs" color="gray.600">
                                  {formatDate(it.created_at)}
                                </Text>
                              </Td>
                              <Td>
                                <HStack justify="flex-end">
                                  <IconButton
                                    aria-label="Editar"
                                    icon={<Icon as={FiEdit2} />}
                                    size="sm"
                                    variant="outline"
                                    borderRadius="full"
                                    onClick={() => {
                                      setEditingId(it.id);
                                      setForm({
                                        titulo: it.titulo || "",
                                        region: it.region || "",
                                        lat: String(it.lat ?? ""),
                                        lng: String(it.lng ?? ""),
                                        es_destacado: !!it.es_destacado,
                                      });
                                      setAudioFile(null);
                                    }}
                                  />
                                  <IconButton
                                    aria-label="Eliminar"
                                    icon={<Icon as={FiTrash2} />}
                                    size="sm"
                                    colorScheme="red"
                                    variant="outline"
                                    borderRadius="full"
                                    onClick={() => onDelete(it.id)}
                                  />
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  )}
                </CardBody>
              </Card>
            </SimpleGrid>
          ) : null}
        </CardBody>
      </Card>
    </Box>
  );
}
