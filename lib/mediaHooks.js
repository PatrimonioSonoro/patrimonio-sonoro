import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

/**
 * Custom hook to get signed URLs for private media files
 * @param {string} filePath - The path to the file in storage (e.g., "audios/123-abc.mp3")
 * @returns {Object} { url, loading, error }
 */
export function useMediaUrl(filePath) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!filePath) {
      setUrl(null);
      setLoading(false);
      setError(null);
      return;
    }

    let isCancelled = false;

    const fetchUrl = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(`Session error: ${sessionError.message}`);
        }
        
        if (!sessionData?.session?.access_token) {
          throw new Error('No access token found');
        }

        // Fetch signed URL
        const response = await fetch(`/api/media/${filePath}`, {
          headers: {
            'Authorization': `Bearer ${sessionData.session.access_token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch media URL: ${response.status}`);
        }

        const data = await response.json();
        
        if (!isCancelled) {
          setUrl(data.url);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message);
          setUrl(null);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchUrl();

    return () => {
      isCancelled = true;
    };
  }, [filePath]);

  return { url, loading, error };
}

/**
 * Custom hook for multiple media URLs
 * @param {Array} filePaths - Array of file paths
 * @returns {Object} { urls, loading, error }
 */
export function useMediaUrls(filePaths = []) {
  const [urls, setUrls] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!filePaths.length) {
      setUrls({});
      setLoading(false);
      setError(null);
      return;
    }

    let isCancelled = false;

    const fetchUrls = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(`Session error: ${sessionError.message}`);
        }
        
        if (!sessionData?.session?.access_token) {
          throw new Error('No access token found');
        }

        const token = sessionData.session.access_token;
        const urlPromises = filePaths.map(async (filePath) => {
          if (!filePath) return { filePath, url: null };

          try {
            const response = await fetch(`/api/media/${filePath}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (!response.ok) {
              throw new Error(`Failed to fetch ${filePath}: ${response.status}`);
            }

            const data = await response.json();
            return { filePath, url: data.url };
          } catch (err) {
            console.warn(`Failed to fetch URL for ${filePath}:`, err);
            return { filePath, url: null };
          }
        });

        const results = await Promise.all(urlPromises);
        
        if (!isCancelled) {
          const urlMap = {};
          results.forEach(({ filePath, url }) => {
            urlMap[filePath] = url;
          });
          setUrls(urlMap);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message);
          setUrls({});
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchUrls();

    return () => {
      isCancelled = true;
    };
  }, [filePaths]);

  return { urls, loading, error };
}
