"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Switch,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  VStack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { FiCheckCircle, FiPlus, FiRefreshCw, FiSearch, FiShield, FiTrash2, FiUser, FiXCircle } from "react-icons/fi";

export default function UsersPage() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  const [query, setQuery] = useState("");

  const createModal = useDisclosure();
  const detailsModal = useDisclosure();
  const deleteDialog = useDisclosure();
  const cancelDeleteRef = useRef(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [createForm, setCreateForm] = useState({
    email: "",
    nombre_completo: "",
    is_admin: false,
  });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("id, user_id, nombre_completo, correo_electronico, role, is_active, fecha_registro")
        .order("fecha_registro", { ascending: false });
      if (error) throw error;
      setRows(data || []);
    } catch (e) {
      setError(e.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data?.user?.id || null);
      const { data: sess } = await supabase.auth.getSession();
      setAccessToken(sess?.session?.access_token || null);
      // Validación adicional: comprobar admin en servidor
      try {
        const { data: isAdminRes } = await supabase.rpc("is_admin", { uid: data?.user?.id });
        setIsAdmin(!!isAdminRes);
      } catch (_) {
        setIsAdmin(false);
      }
      await load();
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((u) => {
      const name = String(u?.nombre_completo || "").toLowerCase();
      const email = String(u?.correo_electronico || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [rows, query]);

  const openDetails = (u) => {
    setSelectedUser(u);
    detailsModal.onOpen();
  };

  const toggleRole = async (id, currentRole) => {
    if (!isAdmin) {
      setError("No autorizado: se requieren permisos de administrador");
      return;
    }
    const nextRole = currentRole === "admin" ? "user" : "admin";
    if (!confirm(`¿Cambiar rol a ${nextRole}?`)) return;
    setUpdatingId(id);
    setError("");
    try {
      const prev = rows.find((r) => r.id === id);
      const { error } = await supabase
        .from("usuarios")
        .update({ role: nextRole })
        .eq("id", id);
      if (error) throw error;
      // Log del cambio
      if (prev) {
        await supabase.from("user_status_logs").insert({
          admin_id: currentUserId,
          target_user_id: prev.user_id,
          prev_role: prev.role,
          new_role: nextRole,
          prev_active: prev.is_active,
          new_active: prev.is_active,
          reason: `Cambio de rol a ${nextRole}`,
        });
      }
      await load();
    } catch (e) {
      setError(e.message || "No se pudo actualizar el rol");
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleActive = async (id, currentActive) => {
    if (!isAdmin) {
      setError("No autorizado: se requieren permisos de administrador");
      return;
    }
    const nextActive = !currentActive;
    if (!confirm(`¿${nextActive ? "Activar" : "Desactivar"} este usuario?`)) return;
    setUpdatingId(id);
    setError("");
    try {
      const prev = rows.find((r) => r.id === id);
      const { error } = await supabase
        .from("usuarios")
        .update({ is_active: nextActive })
        .eq("id", id);
      if (error) throw error;
      // Log del cambio de estado
      if (prev) {
        await supabase.from("user_status_logs").insert({
          admin_id: currentUserId,
          target_user_id: prev.user_id,
          prev_role: prev.role,
          new_role: prev.role,
          prev_active: prev.is_active,
          new_active: nextActive,
          reason: nextActive ? "Activación de cuenta" : "Desactivación de cuenta",
        });
      }
      // Actualización optimista
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, is_active: nextActive } : r)));
    } catch (e) {
      setError(e.message || "No se pudo cambiar el estado");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Box maxW="6xl" mx="auto">
      <Card boxShadow="lg" borderRadius="2xl" overflow="hidden">
        <CardHeader pb={0}>
          <HStack justify="space-between" align="start" spacing={6} flexWrap="wrap">
            <HStack spacing={3} minW="280px">
              <Box
                h="44px"
                w="44px"
                borderRadius="2xl"
                bg="blue.50"
                color="blue.700"
                display="grid"
                placeItems="center"
              >
                <Icon as={FiUser} boxSize={5} />
              </Box>
              <Box>
                <Heading size="md">Gestión de Usuarios</Heading>
                <Text fontSize="sm" color="gray.600">
                  Activa, desactiva y asigna roles de administración.
                </Text>
              </Box>
            </HStack>

            <HStack spacing={2} flexWrap="wrap" justify="flex-end">
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                borderRadius="full"
                onClick={() => {
                  if (!isAdmin) {
                    setError("No autorizado: se requieren permisos de administrador");
                    return;
                  }
                  setCreateForm({ email: "", nombre_completo: "", is_admin: false });
                  createModal.onOpen();
                }}
              >
                Crear
              </Button>
              <IconButton aria-label="Refrescar" icon={<FiRefreshCw />} variant="outline" borderRadius="full" onClick={load} />
            </HStack>
          </HStack>
        </CardHeader>

        <CardBody>
          {error ? (
            <Box mb={6} p={4} borderRadius="xl" bg="red.50" color="red.700" borderWidth="1px" borderColor="red.100">
              {error}
            </Box>
          ) : null}

          {!isAdmin && !loading ? (
            <Box mb={6} p={6} borderRadius="2xl" bg="gray.50" borderWidth="1px" borderColor="blackAlpha.100">
              <Text fontWeight="800" color="gray.700">
                No tienes permisos para ver esta sección.
              </Text>
              <Text mt={1} fontSize="sm" color="gray.600">
                Se requieren permisos de administrador.
              </Text>
            </Box>
          ) : null}

          {isAdmin ? (
            <HStack spacing={3} flexWrap="wrap">
              <InputGroup maxW={{ base: "100%", md: "380px" }}>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre o correo..." />
              </InputGroup>
            </HStack>
          ) : null}

          {loading ? (
            <VStack py={10} spacing={3} align="center">
              <Spinner />
              <Text fontSize="sm" color="gray.600">
                Cargando usuarios...
              </Text>
            </VStack>
          ) : !isAdmin ? null : filtered.length === 0 ? (
            <Box mt={6} p={6} borderRadius="2xl" bg="gray.50" borderWidth="1px" borderColor="blackAlpha.100">
              <Text fontWeight="800" color="gray.700">
                No hay usuarios para mostrar.
              </Text>
              <Text mt={1} fontSize="sm" color="gray.600">
                Ajusta la búsqueda o refresca la lista.
              </Text>
            </Box>
          ) : (
            <TableContainer mt={6} borderRadius="2xl" borderWidth="1px" borderColor="blackAlpha.100">
              <Table variant="simple" size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Nombre</Th>
                    <Th>Correo</Th>
                    <Th>Estado</Th>
                    <Th>Rol</Th>
                    <Th textAlign="right">Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filtered.map((u) => {
                    const isSelf = u.user_id === currentUserId;
                    const canEditRole = !(u.role === "admin" && isSelf);
                    return (
                      <Tr key={u.id} _hover={{ bg: "gray.50" }}>
                        <Td>
                          <Text fontWeight="700" color="gray.800" noOfLines={1}>
                            {u.nombre_completo || "(sin nombre)"}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.700" noOfLines={1}>
                            {u.correo_electronico}
                          </Text>
                        </Td>
                        <Td>
                          {u.is_active ? (
                            <Badge colorScheme="green">Activo</Badge>
                          ) : (
                            <Badge colorScheme="gray">Inactivo</Badge>
                          )}
                        </Td>
                        <Td>
                          {u.role === "admin" ? <Badge colorScheme="purple">admin</Badge> : <Badge colorScheme="blue">user</Badge>}
                        </Td>
                        <Td textAlign="right">
                          <HStack spacing={2} justify="flex-end" flexWrap="wrap">
                            <Button
                              size="xs"
                              variant="outline"
                              borderRadius="full"
                              onClick={() => openDetails(u)}
                            >
                              Ver
                            </Button>
                            <Button
                              size="xs"
                              colorScheme="blue"
                              borderRadius="full"
                              leftIcon={<FiShield />}
                              onClick={() => toggleRole(u.id, u.role)}
                              isDisabled={updatingId === u.id || !canEditRole}
                            >
                              {updatingId === u.id
                                ? "Actualizando..."
                                : u.role === "admin"
                                ? isSelf
                                  ? "Tu rol"
                                  : "Quitar admin"
                                : "Hacer admin"}
                            </Button>
                            <Button
                              size="xs"
                              colorScheme={u.is_active ? "yellow" : "green"}
                              borderRadius="full"
                              leftIcon={u.is_active ? <FiXCircle /> : <FiCheckCircle />}
                              onClick={() => toggleActive(u.id, u.is_active)}
                              isDisabled={updatingId === u.id}
                            >
                              {u.is_active ? "Desactivar" : "Activar"}
                            </Button>
                            <IconButton
                              aria-label="Eliminar"
                              icon={<FiTrash2 />}
                              size="xs"
                              colorScheme="red"
                              variant="outline"
                              borderRadius="full"
                              isDisabled={updatingId === u.id || isSelf}
                              onClick={() => {
                                if (isSelf) {
                                  toast({
                                    title: "Acción no permitida",
                                    description: "No puedes eliminar tu propia cuenta.",
                                    status: "warning",
                                    duration: 4000,
                                    isClosable: true,
                                  });
                                  return;
                                }
                                setDeleteTarget(u);
                                deleteDialog.onOpen();
                              }}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={createModal.isOpen} onClose={createModal.onClose} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Crear usuario</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Correo</FormLabel>
                <Input
                  value={createForm.email}
                  onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="correo@ejemplo.com"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Nombre completo (opcional)</FormLabel>
                <Input
                  value={createForm.nombre_completo}
                  onChange={(e) => setCreateForm((f) => ({ ...f, nombre_completo: e.target.value }))}
                  placeholder="Nombre y apellidos"
                />
                <FormHelperText>Si lo dejas vacío, se usará el correo como referencia.</FormHelperText>
              </FormControl>
              <HStack justify="space-between" borderWidth="1px" borderColor="blackAlpha.100" bg="gray.50" p={3} borderRadius="xl">
                <Box>
                  <Text fontWeight="700" color="gray.800">
                    Rol administrador
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Otorga permisos para administrar el sistema.
                  </Text>
                </Box>
                <Switch
                  isChecked={createForm.is_admin}
                  onChange={(e) => setCreateForm((f) => ({ ...f, is_admin: e.target.checked }))}
                  colorScheme="blue"
                />
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" borderRadius="full" onClick={createModal.onClose}>
                Cancelar
              </Button>
              <Button
                colorScheme="blue"
                borderRadius="full"
                isLoading={loading}
                onClick={async () => {
                  if (!isAdmin) {
                    setError("No autorizado: se requieren permisos de administrador");
                    return;
                  }
                  const email = String(createForm.email || "").trim();
                  if (!email) {
                    setError("El correo es obligatorio");
                    return;
                  }
                  const nombre = String(createForm.nombre_completo || "").trim() || undefined;
                  setLoading(true);
                  setError("");
                  try {
                    const res = await fetch("/api/admin/users", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                      },
                      body: JSON.stringify({
                        email,
                        nombre_completo: nombre,
                        role: createForm.is_admin ? "admin" : "user",
                        is_active: true,
                      }),
                    });
                    const json = await res.json().catch(() => ({}));
                    if (!res.ok) throw new Error(json.error || "Fallo al crear");
                    await load();
                    createModal.onClose();
                    toast({
                      title: "Usuario creado",
                      description: json.email || email,
                      status: "success",
                      duration: 3500,
                      isClosable: true,
                    });
                  } catch (e) {
                    setError(e?.message || "Error al crear usuario");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Crear
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={detailsModal.isOpen} onClose={detailsModal.onClose} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Detalle de usuario</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3} align="stretch">
              <Box>
                <Text fontSize="xs" fontWeight="800" letterSpacing="0.14em" color="gray.500">
                  NOMBRE
                </Text>
                <Text mt={1} fontWeight="800" color="gray.800">
                  {selectedUser?.nombre_completo || "(sin nombre)"}
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight="800" letterSpacing="0.14em" color="gray.500">
                  CORREO
                </Text>
                <Text mt={1} color="gray.700">
                  {selectedUser?.correo_electronico || "-"}
                </Text>
              </Box>
              <HStack spacing={2}>
                <Badge colorScheme={selectedUser?.is_active ? "green" : "gray"}>{selectedUser?.is_active ? "Activo" : "Inactivo"}</Badge>
                <Badge colorScheme={selectedUser?.role === "admin" ? "purple" : "blue"}>{selectedUser?.role || "-"}</Badge>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button borderRadius="full" onClick={detailsModal.onClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog isOpen={deleteDialog.isOpen} onClose={deleteDialog.onClose} leastDestructiveRef={cancelDeleteRef}>
        <AlertDialogOverlay />
        <AlertDialogContent borderRadius="2xl">
          <AlertDialogHeader>Eliminar usuario</AlertDialogHeader>
          <AlertDialogBody>
            Esta acción no se puede deshacer. ¿Quieres eliminar a {deleteTarget?.correo_electronico || "este usuario"}?
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelDeleteRef} onClick={deleteDialog.onClose} borderRadius="full" variant="ghost">
              Cancelar
            </Button>
            <Button
              colorScheme="red"
              borderRadius="full"
              ml={3}
              isLoading={updatingId === deleteTarget?.id}
              onClick={async () => {
                const u = deleteTarget;
                if (!u) return;
                if (!isAdmin) {
                  setError("No autorizado: se requieren permisos de administrador");
                  deleteDialog.onClose();
                  return;
                }
                if (u.user_id === currentUserId) {
                  toast({
                    title: "Acción no permitida",
                    description: "No puedes eliminar tu propia cuenta.",
                    status: "warning",
                    duration: 4000,
                    isClosable: true,
                  });
                  deleteDialog.onClose();
                  return;
                }
                setUpdatingId(u.id);
                setError("");
                try {
                  const res = await fetch(`/api/admin/users/${u.user_id}`, {
                    method: "DELETE",
                    headers: {
                      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                    },
                  });
                  const json = await res.json().catch(() => ({}));
                  if (!res.ok) throw new Error(json.error || "Fallo al eliminar");
                  await load();
                  toast({ title: "Usuario eliminado", status: "success", duration: 2500, isClosable: true });
                  deleteDialog.onClose();
                } catch (e) {
                  setError(e?.message || "Error al eliminar");
                } finally {
                  setUpdatingId(null);
                }
              }}
            >
              Eliminar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
}
