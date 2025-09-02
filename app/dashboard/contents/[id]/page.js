"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  InputGroup,
  InputLeftElement,
  Icon,
  Image,
  useToast,
  HStack,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import { FiFileText, FiUpload, FiImage, FiVideo, FiTrash2 } from "react-icons/fi";

export default function EditContentPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const toast = useToast();

  const [form, setForm] = useState({ title: "", description: "", region: "", status: "draft" });
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("contenidos")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw error;
        setRow(data || null);
        setForm({
          title: data?.title || "",
          description: data?.description || "",
          region: data?.region || "",
          status: data?.status || "draft",
        });
      } catch (e) {
        setError(e.message || "No se pudo cargar el contenido");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleFile = (e, setFile) => setFile(e.target.files?.[0] || null);

  async function uploadToStorage(file, folder) {
    if (!file) return null;
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const path = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage.from("contenido").upload(path, file, { cacheControl: "3600", upsert: true });
    if (error) throw error;
    const { data: publicData } = supabase.storage.from("contenido").getPublicUrl(path);
    const publicUrl = publicData?.publicUrl || null;
    return { path, publicUrl };
  }

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // ensure bucket exists (server-side)
      await fetch("/api/admin/ensure-bucket", { method: "POST" });

      // upload new files first
      const uploads = {};
      if (audioFile) uploads.audio = await uploadToStorage(audioFile, "audios");
      if (imageFile) uploads.image = await uploadToStorage(imageFile, "imagenes");
      if (videoFile) uploads.video = await uploadToStorage(videoFile, "videos");

      // get user id
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id || null;

      // Build update payload with only existing columns to avoid DB errors
      const allowed = row ? Object.keys(row) : [];
      const payload = {};
      const meta = {
        title: form.title || null,
        description: form.description || null,
        region: form.region || null,
        status: form.status || "draft",
        updated_by: userId,
      };
      // copy metadata if column exists
      for (const k of Object.keys(meta)) if (allowed.includes(k)) payload[k] = meta[k];

      // helper to map upload results into existing columns
      const mapMedia = (type, result) => {
        if (!result || !row) return;
        const candidates = {
          audio: ["audio_path", "audio_url", "audio_public_url", "audio"],
          image: ["image_path", "image_url", "image_public_url", "image"],
          video: ["video_path", "video_url", "video_public_url", "video"],
        }[type];
        for (const col of candidates) {
          if (allowed.includes(col)) {
            // prefer publicUrl for url-like fields, path for path fields
            if (col.includes("url") || col.includes("public")) payload[col] = result.publicUrl;
            else payload[col] = result.path;
            break;
          }
        }
      };

      mapMedia("audio", uploads.audio);
      mapMedia("image", uploads.image);
      mapMedia("video", uploads.video);

      // if payload empty for meta fields (no columns), still attempt a safe update with minimal fields
      const hasPayload = Object.keys(payload).length > 0;
      if (!hasPayload) {
        // attempt to update known metadata columns fallback
        const fallback = {
          title: meta.title,
          description: meta.description,
          region: meta.region,
          status: meta.status,
          updated_by: meta.updated_by,
        };
        const { error: errFallback } = await supabase.from("contenidos").update(fallback).eq("id", id);
        if (errFallback) throw errFallback;
      } else {
        const { error } = await supabase.from("contenidos").update(payload).eq("id", id);
        if (error) throw error;
      }

      toast({ title: "Contenido actualizado", status: "success", duration: 3000, isClosable: true });
      router.replace("/dashboard/contents");
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al guardar");
      toast({ title: "Error", description: e.message || "No se pudo actualizar", status: "error", duration: 6000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!confirm("¿Eliminar este contenido? Esta acción no se puede deshacer.")) return;
    setSaving(true);
    setError("");
    try {
      const { error } = await supabase.from("contenidos").delete().eq("id", id);
      if (error) throw error;
      router.replace("/dashboard/contents");
    } catch (e) {
      setError(e.message || "Error al eliminar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card maxW="3xl" mx="auto" boxShadow="md">
      <CardBody>
        <HStack justify="space-between" mb={4}>
          <Heading size="md">Editar contenido</Heading>
          <Link href="/dashboard/contents">Volver</Link>
        </HStack>

        {loading ? (
          <VStack align="center" py={8}>
            <Spinner />
            <Box>Cargando...</Box>
          </VStack>
        ) : (
          <Box as="form" onSubmit={onSave}>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Título</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiFileText} color="gray.400" />
                  </InputLeftElement>
                  <Input name="title" value={form.title} onChange={onChange} placeholder="Título" />
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel>Descripción</FormLabel>
                <Textarea name="description" value={form.description} onChange={onChange} placeholder="Descripción" />
              </FormControl>

              <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                <FormControl>
                  <FormLabel>Región</FormLabel>
                  <Input name="region" value={form.region} onChange={onChange} placeholder="Región" />
                </FormControl>
                <FormControl>
                  <FormLabel>Estado</FormLabel>
                  <Select name="status" value={form.status} onChange={onChange}>
                    <option value="draft">Borrador</option>
                    <option value="published">Publicado</option>
                    <option value="archived">Archivado</option>
                  </Select>
                </FormControl>
              </Stack>

              {/* Media inputs with previews if available */}
              <Stack spacing={3}>
                <FormControl>
                  <FormLabel>Archivo de audio (opcional)</FormLabel>
                  {row && (row.audio_url || row.audio_public_url || row.audio_path || row.audio) ? (
                    <Box mb={2}>
                      <audio controls src={row.audio_public_url || row.audio_url || row.audio || null} />
                    </Box>
                  ) : null}
                  <Input type="file" accept="audio/*" onChange={(e) => handleFile(e, setAudioFile)} />
                </FormControl>

                <FormControl>
                  <FormLabel>Imagen (opcional)</FormLabel>
                  {row && (row.image_public_url || row.image_url || row.image_path || row.image) ? (
                    <Image src={row.image_public_url || row.image_url || row.image || null} alt="preview" maxH="200px" objectFit="contain" mb={2} />
                  ) : null}
                  <Input type="file" accept="image/*" onChange={(e) => handleFile(e, setImageFile)} />
                </FormControl>

                <FormControl>
                  <FormLabel>Video (opcional)</FormLabel>
                  {row && (row.video_public_url || row.video_url || row.video_path || row.video) ? (
                    <Box mb={2}>
                      <video controls src={row.video_public_url || row.video_url || row.video || null} style={{ maxHeight: 240, width: '100%' }} />
                    </Box>
                  ) : null}
                  <Input type="file" accept="video/*" onChange={(e) => handleFile(e, setVideoFile)} />
                </FormControl>
              </Stack>

              {error && <Box color="red.500">{error}</Box>}

              <HStack spacing={3}>
                <Button type="submit" colorScheme="blue" leftIcon={<FiUpload />} isLoading={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
                <Button colorScheme="red" variant="outline" leftIcon={<FiTrash2 />} onClick={onDelete} isLoading={saving}>Eliminar</Button>
              </HStack>
            </Stack>
          </Box>
        )}
      </CardBody>
    </Card>
  );
}
