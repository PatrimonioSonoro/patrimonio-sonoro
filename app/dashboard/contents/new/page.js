"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import {
  Box,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  Card,
  CardBody,
  Heading,
  useToast,
  Icon,
  SimpleGrid,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { FiUpload, FiImage, FiVideo, FiFileText } from "react-icons/fi";

export default function NewContentPage() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({ title: "", description: "", region: "", status: "draft" });
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploads, setUploads] = useState({});

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleFile = (e, setFile) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  async function uploadToStorage(file, folder) {
    if (!file) return null;
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
    const path = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage.from('contenido').upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;

    // get public url
    const { data: publicData } = supabase.storage.from('contenido').getPublicUrl(path);
    const publicUrl = publicData?.publicUrl || null;
    return { path, publicUrl };
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setUploads({});

    try {
      // ensure bucket exists (server-side uses service role key)
      await fetch('/api/admin/ensure-bucket', { method: 'POST' });

      // get user id
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id || null;

      // Upload files (if any) to respective folders
      const results = {};
      if (audioFile) {
        results.audio = await uploadToStorage(audioFile, 'audios');
      }
      if (imageFile) {
        results.image = await uploadToStorage(imageFile, 'imagenes');
      }
      if (videoFile) {
        results.video = await uploadToStorage(videoFile, 'videos');
      }

      setUploads(results);

      // Insert content record (keep schema compatible with existing table)
      const insertPayload = {
        title: form.title || null,
        description: form.description || null,
        region: form.region || null,
        status: form.status || 'draft',
        created_by: userId,
        updated_by: userId,
      };

      const { data, error } = await supabase.from('contenidos').insert(insertPayload).select('id').single();
      if (error) throw error;

      // show success toast and navigate
      toast({ title: 'Contenido creado', description: 'Se subieron los archivos correctamente.', status: 'success', duration: 4000, isClosable: true });
      router.replace(`/dashboard/contents/${data.id}`);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Error al crear contenido o subir archivos');
      toast({ title: 'Error', description: e.message || 'Error al crear contenido', status: 'error', duration: 6000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card maxW="3xl" mx="auto" boxShadow="lg">
      <CardBody>
        <Heading size="md" mb={4}>Nuevo contenido</Heading>
        <Box as="form" onSubmit={onSubmit}>
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

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
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
            </SimpleGrid>

            <FormControl>
              <FormLabel>Archivo de audio</FormLabel>
              <Input type="file" accept="audio/*" onChange={(e) => handleFile(e, setAudioFile)} />
            </FormControl>

            <FormControl>
              <FormLabel>Imagen</FormLabel>
              <Input type="file" accept="image/*" onChange={(e) => handleFile(e, setImageFile)} />
            </FormControl>

            <FormControl>
              <FormLabel>Video</FormLabel>
              <Input type="file" accept="video/*" onChange={(e) => handleFile(e, setVideoFile)} />
            </FormControl>

            {error && <Box color="red.500">{error}</Box>}

            <Button type="submit" colorScheme="blue" leftIcon={<FiUpload />} isLoading={saving}>{saving ? 'Subiendo...' : 'Crear contenido'}</Button>
          </Stack>
        </Box>
      </CardBody>
    </Card>
  );
}
