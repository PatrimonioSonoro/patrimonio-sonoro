"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import {
  Box,
  HStack,
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
  Icon,
  Progress,
  Text,
} from "@chakra-ui/react";
import { FiArrowLeft, FiMusic, FiSave, FiUpload } from "react-icons/fi";

export default function NewAlbumPage() {
  const router = useRouter();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setProgress(0);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("No autorizado");

      if (!title.trim()) throw new Error("El título es obligatorio");

      const fd = new FormData();
      fd.set("title", title);
      fd.set("description", description);
      if (coverFile) fd.append("cover_image", coverFile, coverFile.name);

      const uploadWithProgress = (formData, accessToken, onProgress) => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/admin/albums");
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

      const { status, json } = await uploadWithProgress(fd, token, (p) => setProgress(p));

      if (status < 200 || status >= 300) {
        throw new Error(json?.error || `Error al crear álbum (status ${status})`);
      }

      if (!json?.id) throw new Error("No se retornó ID del álbum");

      toast({
        title: "Álbum creado",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      router.replace(`/dashboard/albums/${json.id}`);
    } catch (e2) {
      setError(e2.message || "Error al crear álbum");
      toast({
        title: "Error",
        description: e2.message || "Error al crear álbum",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
      setTimeout(() => setProgress(0), 800);
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
                <Icon as={FiMusic} boxSize={5} />
              </Box>
              <Box>
                <Heading size="md">Nuevo álbum</Heading>
                <Text fontSize="sm" color="gray.600">
                  Crea una colección y adjunta una portada (opcional).
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
          <Box as="form" onSubmit={onSubmit}>
            <Card variant="outline" borderRadius="2xl" overflow="hidden">
              <CardHeader>
                <Heading size="sm">Detalles</Heading>
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Título, descripción y portada.
                </Text>
              </CardHeader>
              <Divider />
              <CardBody>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel>Título</FormLabel>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" />
                    <FormHelperText>Ejemplo: CampeSENA, Sonidos del Territorio, etc.</FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Descripción</FormLabel>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción" rows={5} />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Portada (opcional)</FormLabel>
                    <Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
                  </FormControl>
                </Stack>
              </CardBody>
            </Card>

            {error && (
              <Box mt={6} color="red.700" p={4} borderRadius="xl" bg="red.50" borderWidth="1px" borderColor="red.100">
                {error}
              </Box>
            )}

            {progress > 0 && progress < 100 && (
              <Box mt={6}>
                <Progress value={progress} colorScheme="blue" size="lg" borderRadius="full" />
              </Box>
            )}

            <Button
              mt={6}
              type="submit"
              colorScheme="blue"
              leftIcon={coverFile ? <FiUpload /> : <FiSave />}
              isLoading={saving}
              loadingText="Creando..."
              disabled={saving}
              size="lg"
              borderRadius="full"
            >
              Crear álbum
            </Button>
          </Box>
        </CardBody>
      </Card>
    </Box>
  );
}
