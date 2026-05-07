"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import { useMediaUrl } from "../../../../lib/mediaHooks";
import {
  Box,
  Stack,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Textarea,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Heading,
  useToast,
  Progress,
  HStack,
  Icon,
  Text,
  SimpleGrid,
  Spinner,
  VStack,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiMusic,
  FiSave,
  FiUpload,
  FiTrash2,
  FiEdit2,
  FiPlus,
  FiFileText,
  FiUser,
  FiClock,
  FiMic,
} from "react-icons/fi";

export default function AlbumDetailPage() {
  const params = useParams();
  const albumId = params?.id;
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState(null);

  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);

  const coverMedia = useMediaUrl(album?.cover_image_path);

  const [albumForm, setAlbumForm] = useState({ title: "", description: "" });
  const [albumCoverFile, setAlbumCoverFile] = useState(null);
  const [savingAlbum, setSavingAlbum] = useState(false);
  const [albumProgress, setAlbumProgress] = useState(0);

  const [songForm, setSongForm] = useState({
    title: "",
    artist: "",
    duration: "",
    composition_lyrics: "",
    production_engineering: "",
    producer: "",
    mastering_engineer: "",
    performers: "",
    sources: "",
  });
  const [audioFile, setAudioFile] = useState(null);
  const [savingSong, setSavingSong] = useState(false);
  const [songProgress, setSongProgress] = useState(0);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token || null;
      setToken(accessToken);

      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes?.user?.id;
      if (!uid) throw new Error("No autorizado");

      const { data: isAdminRes, error: adminErr } = await supabase.rpc("is_admin", { uid });
      if (adminErr || !isAdminRes) {
        setIsAdmin(false);
        throw new Error("No autorizado: se requieren permisos de administrador");
      }
      setIsAdmin(true);

      const res = await fetch(`/api/albums/${albumId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error al cargar el álbum");

      setAlbum(json.album || null);
      setSongs(json.songs || []);

      setAlbumForm({
        title: json.album?.title || "",
        description: json.album?.description || "",
      });
      setAlbumCoverFile(null);
    } catch (e) {
      setError(e.message || "Error al cargar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!albumId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumId]);

  const resetSongForm = () => {
    setSongForm({
      title: "",
      artist: "",
      duration: "",
      composition_lyrics: "",
      production_engineering: "",
      producer: "",
      mastering_engineer: "",
      performers: "",
      sources: "",
    });
    setAudioFile(null);
  };

  const xhrRequest = (method, url, accessToken, formData, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      if (accessToken) xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        let json = null;
        try {
          json = xhr.responseText ? JSON.parse(xhr.responseText) : null;
        } catch (_) {
          json = null;
        }
        resolve({ status: xhr.status, json });
      };
      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send(formData);
    });
  };

  const onSaveAlbum = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setError("No autorizado");
      return;
    }

    setSavingAlbum(true);
    setAlbumProgress(0);
    setError("");

    try {
      if (!token) throw new Error("No autorizado");
      if (!albumForm.title.trim()) throw new Error("El título es obligatorio");

      const fd = new FormData();
      fd.set("title", albumForm.title);
      fd.set("description", albumForm.description);
      if (albumCoverFile) fd.append("cover_image", albumCoverFile, albumCoverFile.name);

      const { status, json } = await xhrRequest(
        "PATCH",
        `/api/admin/albums/${albumId}`,
        token,
        fd,
        (p) => setAlbumProgress(p)
      );

      if (status < 200 || status >= 300) {
        throw new Error(json?.error || `Error al actualizar álbum (status ${status})`);
      }

      toast({ title: "Álbum actualizado", status: "success", duration: 2500, isClosable: true });
      await load();
    } catch (e2) {
      setError(e2.message || "Error al actualizar álbum");
      toast({
        title: "Error",
        description: e2.message || "Error al actualizar álbum",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setSavingAlbum(false);
      setTimeout(() => setAlbumProgress(0), 800);
    }
  };

  const onDeleteAlbum = async () => {
    if (!isAdmin) {
      setError("No autorizado");
      return;
    }
    if (!confirm("¿Eliminar este álbum? Esto eliminará también las canciones. Esta acción no se puede deshacer.")) {
      return;
    }

    setSavingAlbum(true);
    setError("");
    try {
      if (!token) throw new Error("No autorizado");
      const res = await fetch(`/api/admin/albums/${albumId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Error al eliminar");

      toast({ title: "Álbum eliminado", status: "success", duration: 2500, isClosable: true });
      window.location.href = "/dashboard/albums";
    } catch (e2) {
      setError(e2.message || "Error al eliminar álbum");
      toast({
        title: "Error",
        description: e2.message || "Error al eliminar álbum",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setSavingAlbum(false);
    }
  };

  const onCreateSong = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setError("No autorizado");
      return;
    }

    setSavingSong(true);
    setSongProgress(0);

    try {
      if (!token) throw new Error("No autorizado");
      if (!songForm.title.trim()) throw new Error("El título de la canción es obligatorio");
      if (!songForm.artist.trim()) throw new Error("El artista es obligatorio");
      if (!audioFile) throw new Error("Debes subir un audio");

      const fd = new FormData();
      fd.set("album_id", albumId);
      fd.set("title", songForm.title);
      fd.set("artist", songForm.artist);
      if (songForm.duration !== "") fd.set("duration", songForm.duration);

      fd.set("composition_lyrics", songForm.composition_lyrics);
      fd.set("production_engineering", songForm.production_engineering);
      fd.set("producer", songForm.producer);
      fd.set("mastering_engineer", songForm.mastering_engineer);
      fd.set("performers", songForm.performers);
      fd.set("sources", songForm.sources);

      fd.append("audio", audioFile, audioFile.name);

      const uploadWithProgress = (formData, accessToken, onProgress) => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/admin/songs");
          xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              onProgress(percent);
            }
          };

          xhr.onload = () => {
            let json = null;
            try {
              json = xhr.responseText ? JSON.parse(xhr.responseText) : null;
            } catch (_) {
              json = null;
            }
            resolve({ status: xhr.status, json });
          };

          xhr.onerror = () => reject(new Error("Network error during upload"));
          xhr.send(formData);
        });
      };

      const { status, json } = await uploadWithProgress(fd, token, (p) => setSongProgress(p));
      if (status < 200 || status >= 300) {
        throw new Error(json?.error || `Error al crear canción (status ${status})`);
      }

      toast({
        title: "Canción agregada",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      resetSongForm();
      await load();
    } catch (e2) {
      setError(e2.message || "Error al crear canción");
      toast({
        title: "Error",
        description: e2.message || "Error al crear canción",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setSavingSong(false);
      setTimeout(() => setSongProgress(0), 800);
    }
  };

  const songAudioPaths = useMemo(() => songs.map((s) => s.audio_path).filter(Boolean), [songs]);

  return (
    <Box maxW="6xl" mx="auto">
      <Card boxShadow="lg" borderRadius="2xl" overflow="hidden">
        <CardHeader pb={0}>
          <HStack justify="space-between" align="start" spacing={6} flexWrap="wrap">
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
                <Heading size="md">Álbum</Heading>
                <Text fontSize="sm" color="gray.600">
                  Detalle, portada y gestión de canciones.
                </Text>
              </Box>
            </HStack>

            <Button
              variant="outline"
              leftIcon={<FiArrowLeft />}
              borderRadius="full"
              onClick={() => router.push("/dashboard/albums")}
            >
              Volver
            </Button>
          </HStack>
        </CardHeader>

        <CardBody>
          {loading ? (
            <VStack py={10} spacing={3} align="center">
              <Spinner />
              <Text fontSize="sm" color="gray.600">
                Cargando álbum...
              </Text>
            </VStack>
          ) : error ? (
            <Box mt={2} p={4} borderRadius="xl" bg="red.50" color="red.700" borderWidth="1px" borderColor="red.100">
              {error}
            </Box>
          ) : null}

          {!loading && album && (
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} alignItems="start">
              <Card variant="outline" borderRadius="2xl" overflow="hidden">
                <CardHeader>
                  <Heading size="sm">Resumen</Heading>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    Información pública del álbum.
                  </Text>
                </CardHeader>
                <Divider />
                <CardBody>
                  <Stack spacing={4}>
                    <Box>
                      <Text fontSize="xs" fontWeight="800" letterSpacing="0.14em" color="gray.500">
                        TÍTULO
                      </Text>
                      <Text mt={1} fontWeight="800" color="gray.800">
                        {album.title || "(Sin título)"}
                      </Text>
                    </Box>

                    {album.description ? (
                      <Box>
                        <Text fontSize="xs" fontWeight="800" letterSpacing="0.14em" color="gray.500">
                          DESCRIPCIÓN
                        </Text>
                        <Text mt={1} color="gray.700">
                          {album.description}
                        </Text>
                      </Box>
                    ) : null}

                    {album.cover_image_path ? (
                      <Box>
                        <Text fontSize="xs" fontWeight="800" letterSpacing="0.14em" color="gray.500" mb={2}>
                          PORTADA
                        </Text>
                        {coverMedia.loading && (
                          <Text fontSize="sm" color="gray.600">
                            Cargando portada...
                          </Text>
                        )}
                        {coverMedia.url && (
                          <Box
                            borderRadius="2xl"
                            overflow="hidden"
                            borderWidth="1px"
                            borderColor="blackAlpha.100"
                            bg="gray.50"
                            maxW="320px"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={coverMedia.url} alt={album.title} style={{ width: "100%", height: "auto", display: "block" }} />
                          </Box>
                        )}
                      </Box>
                    ) : null}

                    <HStack spacing={2} color="gray.600" fontSize="sm">
                      <Icon as={FiClock} />
                      <Text>{album.created_at ? new Date(album.created_at).toLocaleString() : "-"}</Text>
                    </HStack>
                  </Stack>
                </CardBody>
              </Card>

              {!isAdmin ? (
                <Card variant="outline" borderRadius="2xl" overflow="hidden">
                  <CardBody>
                    <Text fontWeight="800" color="gray.700">
                      No tienes permisos para editar este álbum.
                    </Text>
                    <Text mt={1} fontSize="sm" color="gray.600">
                      Se requieren permisos de administrador.
                    </Text>
                  </CardBody>
                </Card>
              ) : (
                <Card variant="outline" borderRadius="2xl" overflow="hidden">
                  <CardHeader>
                    <Heading size="sm">Editar álbum</Heading>
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      Actualiza metadatos y portada.
                    </Text>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <Box as="form" onSubmit={onSaveAlbum}>
                      <Stack spacing={4}>
                        <FormControl>
                          <FormLabel>Título</FormLabel>
                          <Input
                            value={albumForm.title}
                            onChange={(e) => setAlbumForm((f) => ({ ...f, title: e.target.value }))}
                            placeholder="Título"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Descripción</FormLabel>
                          <Textarea
                            value={albumForm.description}
                            onChange={(e) => setAlbumForm((f) => ({ ...f, description: e.target.value }))}
                            placeholder="Descripción"
                            rows={5}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Reemplazar portada (opcional)</FormLabel>
                          <Input type="file" accept="image/*" onChange={(e) => setAlbumCoverFile(e.target.files?.[0] || null)} />
                          <FormHelperText>Recomendado: imagen cuadrada (1:1).</FormHelperText>
                        </FormControl>

                        {albumProgress > 0 && albumProgress < 100 && (
                          <Box>
                            <Progress value={albumProgress} colorScheme="blue" size="lg" borderRadius="full" />
                          </Box>
                        )}

                        <HStack spacing={3} flexWrap="wrap" justify="space-between">
                          <Button
                            type="submit"
                            colorScheme="blue"
                            leftIcon={albumCoverFile ? <FiUpload /> : <FiSave />}
                            isLoading={savingAlbum}
                            loadingText="Guardando..."
                            disabled={savingAlbum}
                            borderRadius="full"
                          >
                            Guardar álbum
                          </Button>
                          <Button
                            colorScheme="red"
                            variant="outline"
                            leftIcon={<FiTrash2 />}
                            onClick={onDeleteAlbum}
                            isLoading={savingAlbum}
                            disabled={savingAlbum}
                            borderRadius="full"
                          >
                            Eliminar
                          </Button>
                        </HStack>
                      </Stack>
                    </Box>
                  </CardBody>
                </Card>
              )}
            </SimpleGrid>
          )}

          {!loading && !!songs.length && (
            <Card mt={6} variant="outline" borderRadius="2xl" overflow="hidden">
              <CardHeader>
                <Heading size="sm">Canciones</Heading>
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Gestiona las pistas del álbum.
                </Text>
              </CardHeader>
              <Divider />
              <CardBody>
                <Stack spacing={3}>
                  {songs.map((s) => (
                    <SongRow key={s.id} song={s} token={token} isAdmin={isAdmin} onChanged={load} onError={setError} />
                  ))}
                </Stack>
              </CardBody>
            </Card>
          )}

          {!loading && isAdmin && (
            <Card mt={6} variant="outline" borderRadius="2xl" overflow="hidden">
              <CardHeader>
                <Heading size="sm">Agregar canción</Heading>
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Sube el audio y registra créditos culturales.
                </Text>
              </CardHeader>
              <Divider />
              <CardBody>
                <Box as="form" onSubmit={onCreateSong}>
                  <Stack spacing={4}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      <FormControl>
                        <FormLabel>Título</FormLabel>
                        <Input
                          value={songForm.title}
                          onChange={(e) => setSongForm((f) => ({ ...f, title: e.target.value }))}
                          placeholder="Título"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Artista</FormLabel>
                        <Input
                          value={songForm.artist}
                          onChange={(e) => setSongForm((f) => ({ ...f, artist: e.target.value }))}
                          placeholder="Artista"
                        />
                      </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      <FormControl>
                        <FormLabel>Duración (segundos, opcional)</FormLabel>
                        <Input
                          value={songForm.duration}
                          onChange={(e) => setSongForm((f) => ({ ...f, duration: e.target.value }))}
                          inputMode="numeric"
                          placeholder="Ej: 215"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Audio</FormLabel>
                        <Input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
                        <FormHelperText>Formatos recomendados: MP3 / WAV.</FormHelperText>
                      </FormControl>
                    </SimpleGrid>

                    <Box>
                      <HStack spacing={2} color="gray.700">
                        <Icon as={FiFileText} />
                        <Text fontWeight="800">Créditos</Text>
                      </HStack>
                      <Text mt={1} fontSize="sm" color="gray.600">
                        Estos campos ayudan a documentar la ficha técnica musical.
                      </Text>
                    </Box>

                    <FormControl>
                      <FormLabel>Composición / Letra</FormLabel>
                      <Textarea value={songForm.composition_lyrics} onChange={(e) => setSongForm((f) => ({ ...f, composition_lyrics: e.target.value }))} />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Producción / Ingeniería</FormLabel>
                      <Textarea value={songForm.production_engineering} onChange={(e) => setSongForm((f) => ({ ...f, production_engineering: e.target.value }))} />
                    </FormControl>

                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      <FormControl>
                        <FormLabel>Productor</FormLabel>
                        <Input value={songForm.producer} onChange={(e) => setSongForm((f) => ({ ...f, producer: e.target.value }))} />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Masterización</FormLabel>
                        <Input value={songForm.mastering_engineer} onChange={(e) => setSongForm((f) => ({ ...f, mastering_engineer: e.target.value }))} />
                      </FormControl>
                    </SimpleGrid>

                    <FormControl>
                      <FormLabel>Intérpretes</FormLabel>
                      <Textarea value={songForm.performers} onChange={(e) => setSongForm((f) => ({ ...f, performers: e.target.value }))} />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Fuentes</FormLabel>
                      <Textarea value={songForm.sources} onChange={(e) => setSongForm((f) => ({ ...f, sources: e.target.value }))} />
                    </FormControl>

                    {songProgress > 0 && songProgress < 100 && (
                      <Box>
                        <Progress value={songProgress} colorScheme="blue" size="lg" borderRadius="full" />
                      </Box>
                    )}

                    <Button
                      type="submit"
                      colorScheme="blue"
                      leftIcon={<FiPlus />}
                      isLoading={savingSong}
                      loadingText="Subiendo..."
                      disabled={savingSong}
                      size="lg"
                      borderRadius="full"
                    >
                      Agregar canción
                    </Button>
                  </Stack>
                </Box>
              </CardBody>
            </Card>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}

function SongRow({ song, token, isAdmin, onChanged, onError }) {
  const audioMedia = useMediaUrl(song?.audio_path);

  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: song?.title || "",
    artist: song?.artist || "",
    duration: song?.duration ?? "",
    composition_lyrics: song?.credits?.composition_lyrics || "",
    production_engineering: song?.credits?.production_engineering || "",
    producer: song?.credits?.producer || "",
    mastering_engineer: song?.credits?.mastering_engineer || "",
    performers: song?.credits?.performers || "",
    sources: song?.credits?.sources || "",
  });
  const [audioFile, setAudioFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setForm({
      title: song?.title || "",
      artist: song?.artist || "",
      duration: song?.duration ?? "",
      composition_lyrics: song?.credits?.composition_lyrics || "",
      production_engineering: song?.credits?.production_engineering || "",
      producer: song?.credits?.producer || "",
      mastering_engineer: song?.credits?.mastering_engineer || "",
      performers: song?.credits?.performers || "",
      sources: song?.credits?.sources || "",
    });
    setAudioFile(null);
  }, [song]);

  const xhrRequest = (method, url, accessToken, formData, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      if (accessToken) xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        let json = null;
        try {
          json = xhr.responseText ? JSON.parse(xhr.responseText) : null;
        } catch (_) {
          json = null;
        }
        resolve({ status: xhr.status, json });
      };
      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send(formData);
    });
  };

  const onSave = async () => {
    if (!isAdmin) {
      onError?.("No autorizado");
      return;
    }
    setSaving(true);
    setProgress(0);
    onError?.("");

    try {
      if (!token) throw new Error("No autorizado");
      if (!form.title.trim()) throw new Error("El título es obligatorio");
      if (!form.artist.trim()) throw new Error("El artista es obligatorio");

      const fd = new FormData();
      fd.set("title", form.title);
      fd.set("artist", form.artist);
      fd.set("duration", form.duration === "" ? "" : String(form.duration));

      fd.set("composition_lyrics", form.composition_lyrics);
      fd.set("production_engineering", form.production_engineering);
      fd.set("producer", form.producer);
      fd.set("mastering_engineer", form.mastering_engineer);
      fd.set("performers", form.performers);
      fd.set("sources", form.sources);

      if (audioFile) fd.append("audio", audioFile, audioFile.name);

      const { status, json } = await xhrRequest(
        "PATCH",
        `/api/admin/songs/${song.id}`,
        token,
        fd,
        (p) => setProgress(p)
      );

      if (status < 200 || status >= 300) {
        throw new Error(json?.error || `Error al actualizar canción (status ${status})`);
      }

      toast({ title: "Canción actualizada", status: "success", duration: 2200, isClosable: true });
      setEditing(false);
      await onChanged?.();
    } catch (e) {
      onError?.(e.message || "Error al actualizar canción");
      toast({
        title: "Error",
        description: e.message || "Error al actualizar canción",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  const onDelete = async () => {
    if (!isAdmin) {
      onError?.("No autorizado");
      return;
    }
    if (!confirm("¿Eliminar esta canción? Esta acción no se puede deshacer.")) return;

    setSaving(true);
    onError?.("");
    try {
      if (!token) throw new Error("No autorizado");
      const res = await fetch(`/api/admin/songs/${song.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Error al eliminar");

      toast({ title: "Canción eliminada", status: "success", duration: 2200, isClosable: true });
      await onChanged?.();
    } catch (e) {
      onError?.(e.message || "Error al eliminar canción");
      toast({
        title: "Error",
        description: e.message || "Error al eliminar canción",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box border="1px" borderColor="gray.200" borderRadius="md" p={3}>
      <HStack justify="space-between" align="start" spacing={3}>
        <Box>
          <Box fontWeight="semibold">{song.title}</Box>
          <Box fontSize="sm" color="gray.600">
            {song.artist}
            {song.duration ? ` · ${song.duration}s` : ""}
          </Box>
        </Box>
        {isAdmin && (
          <HStack spacing={2}>
            <Button size="sm" variant="outline" onClick={() => setEditing((v) => !v)} disabled={saving}>
              {editing ? "Cerrar" : "Editar"}
            </Button>
            <Button size="sm" colorScheme="red" variant="outline" onClick={onDelete} isLoading={saving} disabled={saving}>
              Eliminar
            </Button>
          </HStack>
        )}
      </HStack>

      {audioMedia.loading && <Box fontSize="sm">Cargando audio...</Box>}

      {audioMedia.url && (
        <Box mt={2}>
          <audio controls src={audioMedia.url} style={{ width: "100%" }} />
        </Box>
      )}

      {editing && isAdmin && (
        <Box mt={3} borderTop="1px" borderColor="gray.100" pt={3}>
          <Stack spacing={3}>
            <FormControl>
              <FormLabel>Título</FormLabel>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </FormControl>

            <FormControl>
              <FormLabel>Artista</FormLabel>
              <Input value={form.artist} onChange={(e) => setForm((f) => ({ ...f, artist: e.target.value }))} />
            </FormControl>

            <FormControl>
              <FormLabel>Duración (segundos)</FormLabel>
              <Input
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                inputMode="numeric"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Reemplazar audio (opcional)</FormLabel>
              <Input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
            </FormControl>

            <Heading size="xs">Créditos</Heading>

            <FormControl>
              <FormLabel>Composición / Letra</FormLabel>
              <Textarea
                value={form.composition_lyrics}
                onChange={(e) => setForm((f) => ({ ...f, composition_lyrics: e.target.value }))}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Producción / Ingeniería</FormLabel>
              <Textarea
                value={form.production_engineering}
                onChange={(e) => setForm((f) => ({ ...f, production_engineering: e.target.value }))}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Productor</FormLabel>
              <Input value={form.producer} onChange={(e) => setForm((f) => ({ ...f, producer: e.target.value }))} />
            </FormControl>

            <FormControl>
              <FormLabel>Masterización</FormLabel>
              <Input
                value={form.mastering_engineer}
                onChange={(e) => setForm((f) => ({ ...f, mastering_engineer: e.target.value }))}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Intérpretes</FormLabel>
              <Textarea value={form.performers} onChange={(e) => setForm((f) => ({ ...f, performers: e.target.value }))} />
            </FormControl>

            <FormControl>
              <FormLabel>Fuentes</FormLabel>
              <Textarea value={form.sources} onChange={(e) => setForm((f) => ({ ...f, sources: e.target.value }))} />
            </FormControl>

            {progress > 0 && progress < 100 && (
              <Box>
                <Progress value={progress} colorScheme="blue" size="lg" />
              </Box>
            )}

            <Button colorScheme="blue" onClick={onSave} isLoading={saving} disabled={saving}>
              Guardar canción
            </Button>
          </Stack>
        </Box>
      )}

      {song.credits && (
        <Box mt={3} fontSize="sm" color="gray.700">
          <Box fontWeight="semibold" mb={1}>
            Créditos
          </Box>
          <Box whiteSpace="pre-wrap">
            {formatCredits(song.credits)}
          </Box>
        </Box>
      )}
    </Box>
  );
}

function formatCredits(c) {
  const lines = [];
  if (c.composition_lyrics) lines.push(`Composición / Letra: ${c.composition_lyrics}`);
  if (c.production_engineering) lines.push(`Producción / Ingeniería: ${c.production_engineering}`);
  if (c.producer) lines.push(`Productor: ${c.producer}`);
  if (c.mastering_engineer) lines.push(`Masterización: ${c.mastering_engineer}`);
  if (c.performers) lines.push(`Intérpretes: ${c.performers}`);
  if (c.sources) lines.push(`Fuentes: ${c.sources}`);
  return lines.length ? lines.join("\n") : "(sin créditos)";
}
