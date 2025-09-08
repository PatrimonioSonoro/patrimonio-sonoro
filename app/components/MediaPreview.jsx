import { useMediaUrl } from '../lib/mediaHooks';
import { Box, Spinner, Text, Image } from '@chakra-ui/react';

export function MediaPreview({ filePath, type, ...props }) {
  const { url, loading, error } = useMediaUrl(filePath);

  if (!filePath) return null;

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" p={4}>
        <Spinner size="sm" mr={2} />
        <Text fontSize="sm">Cargando...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Text color="red.500" fontSize="sm">
        Error cargando archivo: {error}
      </Text>
    );
  }

  if (!url) return null;

  switch (type) {
    case 'audio':
      return (
        <audio controls style={{ width: '100%' }} {...props}>
          <source src={url} />
          Tu navegador no soporta audio.
        </audio>
      );
    
    case 'video':
      return (
        <video controls style={{ width: '100%', maxHeight: '400px' }} {...props}>
          <source src={url} />
          Tu navegador no soporta video.
        </video>
      );
    
    case 'image':
      return (
        <Image 
          src={url} 
          alt="Imagen del contenido"
          objectFit="contain"
          maxW="100%"
          {...props}
        />
      );
    
    default:
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" {...props}>
          Descargar archivo
        </a>
      );
  }
}

export default MediaPreview;
