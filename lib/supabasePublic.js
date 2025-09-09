import { createClient } from '@supabase/supabase-js';

// Cliente específico para contenido público
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: { persistSession: false }
  }
);

/**
 * Genera URL pública directa para archivos en el bucket contenido
 * @param {string} path - Ruta del archivo en el bucket
 * @returns {string|null} - URL pública directa o null si no hay path
 */
export function getPublicUrl(path) {
  if (!path) return null;
  
  try {
    // Obtener URL pública directa del bucket público "contenido"
    const { data } = supabasePublic.storage
      .from('contenido')
      .getPublicUrl(path);
    
    console.log(`Generated public URL for path "${path}":`, data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('Error generating public URL for path:', path, error);
    return null;
  }
}

/**
 * Genera URLs públicas para un objeto de contenido
 * @param {Object} content - Objeto contenido con paths
 * @returns {Object} - Objeto con URLs públicas agregadas
 */
export function addPublicUrls(content) {
  console.log('Processing content for public URLs:', {
    id: content.id,
    title: content.title,
    paths: {
      image_path: content.image_path,
      audio_path: content.audio_path,
      video_path: content.video_path
    }
  });
  
  const result = {
    ...content,
    image_url: getPublicUrl(content.image_path),
    audio_url: getPublicUrl(content.audio_path),
    video_url: getPublicUrl(content.video_path)
  };
  
  console.log('Generated URLs for content:', {
    id: content.id,
    urls: {
      image_url: result.image_url,
      audio_url: result.audio_url,
      video_url: result.video_url
    }
  });
  
  return result;
}

/**
 * Procesa una lista de contenidos agregando URLs públicas
 * @param {Array} contents - Array de contenidos
 * @returns {Array} - Array con URLs públicas agregadas
 */
export function addPublicUrlsToContents(contents) {
  if (!contents || !Array.isArray(contents)) return [];
  return contents.map(addPublicUrls);
}
