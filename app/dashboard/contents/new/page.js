"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import {
  Box,
  HStack,
  VStack,
  Stack,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Textarea,
  Select,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Heading,
  useToast,
  Icon,
  SimpleGrid,
  InputGroup,
  InputLeftElement,
  Progress,
  Switch,
  Text,
} from "@chakra-ui/react";
import { FiUpload, FiImage, FiVideo, FiFileText, FiArrowLeft } from "react-icons/fi";

export default function NewContentPage() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({ title: "", description: "", region: "", status: "draft" });
  const [visibleToUser, setVisibleToUser] = useState(true);
  const [publiclyVisible, setPubliclyVisible] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploads, setUploads] = useState({});
  const [progress, setProgress] = useState(0);
  const [debugInfo, setDebugInfo] = useState(null);

  const testConnection = async () => {
    try {
      console.log('🧪 Testing connection...');
      
      // Test health endpoint first
      const healthRes = await fetch('/api/admin/health');
      const healthData = await healthRes.json();
      console.log('🏥 Health check:', healthData);
      
      // Test debug endpoint
      const debugRes = await fetch('/api/admin/debug');
      const debugData = await debugRes.json();
      
      setDebugInfo({ health: healthData, debug: debugData });
      console.log('🔗 Debug info:', debugData);
      
      if (healthRes.ok && debugRes.ok && healthData.overall === 'HEALTHY') {
        toast({ 
          title: 'Sistema OK', 
          description: 'Storage, DB y políticas funcionando correctamente', 
          status: 'success' 
        });
      } else {
        const issues = healthData.overall !== 'HEALTHY' ? 
          `Health: ${healthData.overall}` : 
          `Debug: ${debugData.error || 'Unknown issue'}`;
        toast({ 
          title: 'Problemas detectados', 
          description: issues, 
          status: 'warning' 
        });
      }
    } catch (e) {
      console.error('Test failed:', e);
      toast({ title: 'Error de prueba', description: e.message, status: 'error' });
    }
  };

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleFile = (e, setFile) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
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

  // We'll send files directly as multipart/form-data to avoid expensive base64 conversions

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setUploads({});
    setProgress(0);

    try {
      console.log('🚀 Starting content creation process...');
      
  // Note: removed client-side ensure-bucket call — bucket configuration is managed server-side
  setProgress(10);

      // get user session
      console.log('👤 Getting user session...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.log('❌ Session error:', sessionError);
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!sessionData?.session?.user) {
        console.log('❌ No user session found');
        throw new Error('No user session found. Please log in again.');
      }
      
      const userId = sessionData.session.user.id;
      const token = sessionData.session.access_token;
      
      console.log('✅ User session valid:', userId);
      console.log('🎫 Token length:', token?.length);
      
      setProgress(20);

      // validate files
      console.log('🔍 Validating files...');
      const vAudio = validateFile(audioFile, 'audio');
      const vImage = validateFile(imageFile, 'image');
      const vVideo = validateFile(videoFile, 'video');
      
      if (!vAudio.ok) throw new Error(vAudio.msg);
      if (!vImage.ok) throw new Error(vImage.msg);
      if (!vVideo.ok) throw new Error(vVideo.msg);
      
      console.log('✅ File validation passed');
      setProgress(30);

      // Build FormData with text fields + binary files to send directly
      const fd = new FormData();
      fd.set('title', form.title || '');
      fd.set('description', form.description || '');
      fd.set('region', form.region || '');
      fd.set('status', form.status || 'draft');
  fd.set('visible_to_user', visibleToUser ? '1' : '0');
  fd.set('publicly_visible', publiclyVisible ? '1' : '0');

      if (audioFile) fd.append('audio', audioFile, audioFile.name);
      if (imageFile) fd.append('image', imageFile, imageFile.name);
      if (videoFile) fd.append('video', videoFile, videoFile.name);

      // Upload using XMLHttpRequest to get real upload progress events
      setProgress(50);

      console.log('📤 Sending FormData to admin upload endpoint with XHR (progress enabled)...');

      const uploadFormDataWithProgress = (formData, token, onProgress) => {
        return new Promise((resolve, reject) => {
          try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/admin/upload');
            if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                onProgress(percent);
              }
            };

            xhr.onload = () => {
              const status = xhr.status;
              let json = null;
              try {
                json = xhr.responseText ? JSON.parse(xhr.responseText) : null;
              } catch (err) {
                console.warn('⚠️ Could not parse JSON response from upload:', err, xhr.responseText);
              }
              resolve({ status, json });
            };

            xhr.onerror = (err) => {
              reject(new Error('Network error during upload'));
            };

            xhr.send(formData);
          } catch (err) {
            reject(err);
          }
        });
      };

      // Map upload progress (0-100) to UI progress range (50-95) for better UX while server finalizes DB insert
      const progressMap = (p) => Math.min(95, 50 + Math.round((p / 100) * 45));

      const { status, json } = await uploadFormDataWithProgress(fd, token, (p) => {
        setProgress(progressMap(p));
      });

      console.log('📡 Response status:', status);
      console.log('📋 Response data:', json);

      if (status < 200 || status >= 300) {
        const errorMsg = (json && (json.error || json.message)) || `Upload failed with status ${status}`;
        console.log('❌ Upload failed:', errorMsg);
        throw new Error(errorMsg);
      }

      if (!json || !json.id) {
        console.log('❌ No ID in response');
        throw new Error('No content ID returned from server');
      }

      // Ensure progress reaches 100 after DB insert
      setProgress(100);
      
      console.log('✅ Content created successfully with ID:', json.id);

      // show success toast and navigate
      toast({ 
        title: 'Contenido creado', 
        description: 'Se subieron los archivos correctamente.', 
        status: 'success', 
        duration: 4000, 
        isClosable: true 
      });
      
      router.replace(`/dashboard/contents/${json.id}`);
      
    } catch (e) {
      console.error('❌ Content creation failed:', e);
      const errorMessage = e.message || 'Error al crear contenido o subir archivos';
      setError(errorMessage);
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        status: 'error', 
        duration: 8000, 
        isClosable: true 
      });
    } finally {
      setSaving(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

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
                <Icon as={FiFileText} boxSize={5} />
              </Box>
              <Box>
                <Heading size="md">Nuevo contenido</Heading>
                <Text fontSize="sm" color="gray.600">
                  Crea una publicación con audio, imagen y/o video.
                </Text>
              </Box>
            </HStack>

            <Button
              variant="outline"
              leftIcon={<FiArrowLeft />}
              borderRadius="full"
              onClick={() => router.push("/dashboard/contents")}
            >
              Volver
            </Button>
          </HStack>
        </CardHeader>

        <CardBody>
          <Box as="form" onSubmit={onSubmit}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} alignItems="start">
              <Card variant="outline" borderRadius="2xl" overflow="hidden">
                <CardHeader>
                  <Heading size="sm">Detalles</Heading>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    Información editorial, estado y visibilidad.
                  </Text>
                </CardHeader>
                <Divider />
                <CardBody>
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
                      <Textarea name="description" value={form.description} onChange={onChange} placeholder="Descripción" rows={5} />
                    </FormControl>

                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      <FormControl>
                        <FormLabel>Región</FormLabel>
                        <Input name="region" value={form.region} onChange={onChange} placeholder="Región" />
                        <FormHelperText>Ejemplo: Caribe, Andina, Pacífica, Orinoquía, Amazonía.</FormHelperText>
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

                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      <FormControl display="flex" alignItems="center" justifyContent="space-between" p={3} borderRadius="xl" bg="gray.50" borderWidth="1px" borderColor="blackAlpha.100">
                        <Box>
                          <FormLabel mb={0}>Visible a usuarios</FormLabel>
                          <Text fontSize="xs" color="gray.600">
                            Disponible en el espacio privado.
                          </Text>
                        </Box>
                        <Switch isChecked={visibleToUser} onChange={(e) => setVisibleToUser(e.target.checked)} />
                      </FormControl>
                      <FormControl display="flex" alignItems="center" justifyContent="space-between" p={3} borderRadius="xl" bg="gray.50" borderWidth="1px" borderColor="blackAlpha.100">
                        <Box>
                          <FormLabel mb={0}>Visible en página principal</FormLabel>
                          <Text fontSize="xs" color="gray.600">
                            Se muestra en la web pública.
                          </Text>
                        </Box>
                        <Switch isChecked={publiclyVisible} onChange={(e) => setPubliclyVisible(e.target.checked)} />
                      </FormControl>
                    </SimpleGrid>
                  </Stack>
                </CardBody>
              </Card>

              <Card variant="outline" borderRadius="2xl" overflow="hidden">
                <CardHeader>
                  <Heading size="sm">Multimedia</Heading>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    Adjunta archivos para enriquecer el contenido.
                  </Text>
                </CardHeader>
                <Divider />
                <CardBody>
                  <Stack spacing={4}>
                    <FormControl>
                      <FormLabel>Archivo de audio (máx 50MB)</FormLabel>
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
                  </Stack>
                </CardBody>
              </Card>
            </SimpleGrid>

            {debugInfo && (
              <Box mt={6} p={3} bg="gray.50" borderRadius="xl" fontSize="sm" borderWidth="1px" borderColor="blackAlpha.100">
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </Box>
            )}

            {error && (
              <Box mt={6} color="red.700" p={4} borderRadius="xl" bg="red.50" borderWidth="1px" borderColor="red.100">
                {error}
              </Box>
            )}

            {progress > 0 && progress < 100 && (
              <Box mt={6}>
                <Progress value={progress} colorScheme="blue" size="lg" borderRadius="full" />
                <Box textAlign="center" mt={2} fontSize="sm" color="gray.600">
                  {progress < 30
                    ? "Preparando archivos..."
                    : progress < 60
                      ? "Convirtiendo archivos..."
                      : progress < 90
                        ? "Subiendo a storage..."
                        : "Guardando en base de datos..."}
                </Box>
              </Box>
            )}

            <HStack mt={6} spacing={3} flexWrap="wrap" justify="space-between">
              <Button variant="outline" onClick={testConnection} size="sm" colorScheme="gray" borderRadius="full">
                🧪 Probar Conexión
              </Button>

              <Button
                type="submit"
                colorScheme="blue"
                leftIcon={<FiUpload />}
                isLoading={saving}
                loadingText="Subiendo..."
                disabled={saving}
                size="lg"
                borderRadius="full"
              >
                {saving ? "Subiendo..." : "Crear contenido"}
              </Button>
            </HStack>
          </Box>
        </CardBody>
      </Card>
    </Box>
  );
}
