"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import { useMediaUrl } from "../../../../lib/mediaHooks";
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
  Progress,
  Text,
} from "@chakra-ui/react";
import { FiFileText, FiUpload, FiImage, FiVideo, FiTrash2 } from "react-icons/fi";

export default function EditContentPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const toast = useToast();

  const [form, setForm] = useState({ title: "", description: "", region: "", status: "draft" });
  const [visibleToUser, setVisibleToUser] = useState(true);
  const [publiclyVisible, setPubliclyVisible] = useState(false);
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [progress, setProgress] = useState(0);

  // Get signed URLs for existing media
  const audioUrl = useMediaUrl(row?.audio_path);
  const imageUrl = useMediaUrl(row?.image_path);
  const videoUrl = useMediaUrl(row?.video_path);

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
        setVisibleToUser(data?.visible_to_user ?? true);
        setPubliclyVisible(data?.publicly_visible ?? false);
      } catch (e) {
        setError(e.message || "No se pudo cargar el contenido");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleFile = (e, setFile) => setFile(e.target.files?.[0] || null);

  const uploadFilesViaAPI = async (audioFile, imageFile, videoFile) => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw new Error(`Session error: ${sessionError.message}`);
    }
    
    if (!sessionData?.session?.user) {
      throw new Error('No user session found. Please log in again.');
    }
    
    const token = sessionData.session.access_token;
    
    // If replacing files, delete old ones first
    const deletePromises = [];
    if (audioFile && row?.audio_path) {
      deletePromises.push(deleteFile(row.audio_path, token));
    }
    if (imageFile && row?.image_path) {
      deletePromises.push(deleteFile(row.image_path, token));
    }
    if (videoFile && row?.video_path) {
      deletePromises.push(deleteFile(row.video_path, token));
    }
    
    // Wait for deletions to complete (don't fail if deletion fails)
    if (deletePromises.length > 0) {
      await Promise.allSettled(deletePromises);
    }
    
    // Build FormData
    const formData = new FormData();
    formData.set('update_mode', 'true'); // Flag to indicate this is an update
    formData.set('content_id', id); // Content ID for updates
    
    if (audioFile) formData.append('audio', audioFile, audioFile.name);
    if (imageFile) formData.append('image', imageFile, imageFile.name);
    if (videoFile) formData.append('video', videoFile, videoFile.name);

    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed with status ${response.status}`);
    }

    const result = await response.json();
    return result;
  };

  const deleteFile = async (filePath, token) => {
    try {
      const response = await fetch('/api/admin/delete-file', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ filePath })
      });
      
      if (!response.ok) {
        console.warn(`Failed to delete old file: ${filePath}`);
      }
    } catch (error) {
      console.warn(`Error deleting old file: ${filePath}`, error);
    }
  };

  const validateFile = (file, type) => {
    if (!file) return { ok: true };
    
    const sizeMB = file.size / (1024 * 1024);
    const fileType = file.type || '';
    
    // Size validation
    if (type === 'audio' && sizeMB > 50) return { ok: false, msg: 'Audio demasiado grande (máx 50MB)' };
    if (type === 'image' && sizeMB > 5) return { ok: false, msg: 'Imagen demasiado grande (máx 5MB)' };
    if (type === 'video' && sizeMB > 50) return { ok: false, msg: 'Video demasiado grande (máx 50MB)' };
    
    // MIME type validation
    if (type === 'audio' && !fileType.startsWith('audio/')) {
      return { ok: false, msg: 'Formato de audio no válido' };
    }
    if (type === 'image' && !fileType.startsWith('image/')) {
      return { ok: false, msg: 'Formato de imagen no válido' };
    }
    if (type === 'video' && !fileType.startsWith('video/')) {
      return { ok: false, msg: 'Formato de video no válido' };
    }
    
    return { ok: true };
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // Validate files first
      const vAudio = validateFile(audioFile, 'audio');
      const vImage = validateFile(imageFile, 'image');
      const vVideo = validateFile(videoFile, 'video');
      if (!vAudio.ok) throw new Error(vAudio.msg);
      if (!vImage.ok) throw new Error(vImage.msg);
      if (!vVideo.ok) throw new Error(vVideo.msg);

      // Get user id
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id || null;

      // If there are files to upload, use the admin API
      let uploadResults = null;
      if (audioFile || imageFile || videoFile) {
        setProgress(20);
        uploadResults = await uploadFilesViaAPI(audioFile, imageFile, videoFile);
        setProgress(80);
      }

      // Build update payload with metadata
      const payload = {
        title: form.title || null,
        description: form.description || null,
        region: form.region || null,
        status: form.status || "draft",
        visible_to_user: visibleToUser,
        publicly_visible: publiclyVisible,
        updated_by: userId,
      };

      // Add file paths if uploads were successful
      if (uploadResults) {
        if (uploadResults.audio_path) payload.audio_path = uploadResults.audio_path;
        if (uploadResults.image_path) payload.image_path = uploadResults.image_path;
        if (uploadResults.video_path) payload.video_path = uploadResults.video_path;
      }

      // Update the content record
      const { error } = await supabase.from("contenidos").update(payload).eq("id", id);
      if (error) throw error;

  setProgress(100);

      toast({ 
        title: "Contenido actualizado", 
        description: "Los archivos se han guardado correctamente",
        status: "success", 
        duration: 2000, 
        isClosable: true 
      });

      // Redirect to view page immediately
      router.replace(`/dashboard/contents/${id}`);
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al guardar");
      toast({ 
        title: "Error", 
        description: e.message || "No se pudo actualizar", 
        status: "error", 
        duration: 6000, 
        isClosable: true 
      });
    } finally {
      // keep saving state until redirect completes; mark saving false after a short delay
      setTimeout(() => {
        setSaving(false);
        setProgress(0);
      }, 300);
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

              <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                <FormControl>
                  <FormLabel>Visible a usuarios registrados</FormLabel>
                  <input 
                    type="checkbox" 
                    checked={visibleToUser} 
                    onChange={(e) => setVisibleToUser(e.target.checked)} 
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Visible en página principal (público)</FormLabel>
                  <input 
                    type="checkbox" 
                    checked={publiclyVisible} 
                    onChange={(e) => setPubliclyVisible(e.target.checked)} 
                  />
                </FormControl>
              </Stack>

              {/* Media inputs with previews if available */}
              <Stack spacing={3}>
                <FormControl>
                  <FormLabel>Archivo de audio (opcional, máx 50MB)</FormLabel>
                  {row?.audio_path && (
                    <Box mb={2}>
                      {audioUrl.loading && <Spinner size="sm" />}
                      {audioUrl.error && <Text color="red.500" fontSize="sm">Error cargando audio</Text>}
                      {audioUrl.url && <audio controls src={audioUrl.url} style={{ width: '100%' }} />}
                    </Box>
                  )}
                  <Input type="file" accept="audio/*" onChange={(e) => handleFile(e, setAudioFile)} />
                  {audioFile && <Text fontSize="sm" color="blue.600">Nuevo archivo seleccionado: {audioFile.name}</Text>}
                </FormControl>

                <FormControl>
                  <FormLabel>Imagen (opcional)</FormLabel>
                  {row?.image_path && (
                    <Box mb={2}>
                      {imageUrl.loading && <Spinner size="sm" />}
                      {imageUrl.error && <Text color="red.500" fontSize="sm">Error cargando imagen</Text>}
                      {imageUrl.url && <Image src={imageUrl.url} alt="preview" maxH="200px" objectFit="contain" />}
                    </Box>
                  )}
                  <Input type="file" accept="image/*" onChange={(e) => handleFile(e, setImageFile)} />
                  {imageFile && <Text fontSize="sm" color="blue.600">Nueva imagen seleccionada: {imageFile.name}</Text>}
                </FormControl>

                <FormControl>
                  <FormLabel>Video (opcional)</FormLabel>
                  {row?.video_path && (
                    <Box mb={2}>
                      {videoUrl.loading && <Spinner size="sm" />}
                      {videoUrl.error && <Text color="red.500" fontSize="sm">Error cargando video</Text>}
                      {videoUrl.url && <video controls src={videoUrl.url} style={{ maxHeight: 240, width: '100%' }} />}
                    </Box>
                  )}
                  <Input type="file" accept="video/*" onChange={(e) => handleFile(e, setVideoFile)} />
                  {videoFile && <Text fontSize="sm" color="blue.600">Nuevo video seleccionado: {videoFile.name}</Text>}
                </FormControl>
              </Stack>

              {error && <Box color="red.500" p={3} borderRadius="md" bg="red.50">{error}</Box>}

              {progress > 0 && progress < 100 && (
                <Box>
                  <Progress value={progress} colorScheme="blue" size="lg" />
                  <Box textAlign="center" mt={2} fontSize="sm" color="gray.600">
                    {progress < 30 ? 'Preparando archivos...' : 
                     progress < 60 ? 'Subiendo archivos...' : 
                     progress < 90 ? 'Procesando...' : 'Guardando cambios...'}
                  </Box>
                </Box>
              )}

              <HStack spacing={3}>
                <Button type="submit" colorScheme="blue" leftIcon={<FiUpload />} isLoading={saving} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
                <Button colorScheme="red" variant="outline" leftIcon={<FiTrash2 />} onClick={onDelete} isLoading={saving} disabled={saving}>
                  Eliminar
                </Button>
              </HStack>
            </Stack>
          </Box>
        )}
      </CardBody>
    </Card>
  );
}
