"use client";
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

// Hook simplificado para obtener estadísticas del dashboard
export function useAnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Cargando estadísticas...');

      // Obtener conteos básicos
      const { count: pageViewsCount } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true });

      const { data: uniqueUsersData } = await supabase
        .from('page_views')
        .select('session_id');
      
      const uniqueUsers = new Set(uniqueUsersData?.map(u => u.session_id) || []).size;

      const { count: contentInteractions } = await supabase
        .from('content_interactions')
        .select('*', { count: 'exact', head: true });

      const { count: socialClicks } = await supabase
        .from('social_media_clicks')
        .select('*', { count: 'exact', head: true });

      // Páginas más visitadas
      const { data: pageStatsData } = await supabase
        .from('page_views')
        .select('page_path')
        .order('viewed_at', { ascending: false });

      const pageStats = [];
      if (pageStatsData) {
        const pageCounts = {};
        pageStatsData.forEach(page => {
          pageCounts[page.page_path] = (pageCounts[page.page_path] || 0) + 1;
        });
        
        Object.entries(pageCounts).forEach(([path, views]) => {
          pageStats.push({ page_path: path, views });
        });
        
        pageStats.sort((a, b) => b.views - a.views);
      }

      const statsData = {
        pageViews: pageViewsCount || 0,
        uniqueUsers: uniqueUsers || 0,
        contentInteractions: contentInteractions || 0,
        socialClicks: socialClicks || 0,
        pageStats: pageStats.slice(0, 5)
      };

      setStats(statsData);
      console.log('✅ Estadísticas cargadas:', statsData);

    } catch (err) {
      console.error('❌ Error cargando estadísticas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
}

// Hook para suscripciones en tiempo real
export function useRealtimeAnalytics(onUpdate) {
  useEffect(() => {
    console.log('🔄 Configurando suscripciones en tiempo real...');

    const channels = [
      supabase
        .channel('page_views_realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'page_views' }, (payload) => {
          console.log('📄 Nueva vista de página:', payload);
          onUpdate({ ...payload, table: 'page_views' });
        })
        .subscribe(),

      supabase
        .channel('content_interactions_realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'content_interactions' }, (payload) => {
          console.log('🎵 Nueva interacción con contenido:', payload);
          onUpdate({ ...payload, table: 'content_interactions' });
        })
        .subscribe(),

      supabase
        .channel('social_clicks_realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'social_media_clicks' }, (payload) => {
          console.log('📱 Nuevo click en redes sociales:', payload);
          onUpdate({ ...payload, table: 'social_media_clicks' });
        })
        .subscribe()
    ];

    return () => {
      console.log('🔌 Desconectando canales en tiempo real...');
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [onUpdate]);
}

// Función principal para tracking de eventos
export async function trackEvent(eventType, data = {}) {
  // Solo ejecutar en el cliente
  if (typeof window === 'undefined') {
    return { ok: false, error: 'ssr' };
  }

  try {
    console.log(`📊 Tracking ${eventType}:`, data);

    // Generar o recuperar session_id
    let sessionId = null;
    try {
      sessionId = sessionStorage.getItem('analytics_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Crear sesión en la base de datos
        const { error: sessionError } = await supabase
          .from('user_sessions')
          .insert({
            session_id: sessionId,
            user_agent: navigator.userAgent || 'Unknown',
            started_at: timestamp,
            is_active: true
          });

        if (sessionError) {
          console.error('❌ Error creando sesión:', sessionError);
          // Continuar con el tracking aunque falle la sesión
        } else {
          sessionStorage.setItem('analytics_session_id', sessionId);
          console.log('🆕 Nueva sesión creada:', sessionId);
        }
      }
    } catch (e) {
      sessionId = `temp_${Date.now()}`;
      console.warn('⚠️ SessionStorage no disponible, usando ID temporal');
    }

    const timestamp = new Date().toISOString();
    const userAgent = navigator.userAgent || 'Unknown';

    if (eventType === 'page_view') {
      const payload = {
        session_id: sessionId,
        page_path: data.page_url || window.location.pathname,
        page_title: data.page_title || document.title || '',
        referrer: data.referrer_url || document.referrer || '',
        viewed_at: timestamp
      };

      const { data: insertedData, error } = await supabase
        .from('page_views')
        .insert(payload)
        .select();

      if (error) {
        console.error('❌ Error insertando page_view:', error);
        return { ok: false, error };
      }

      console.log('✅ Page view registrada:', insertedData?.[0]?.id);
      return { ok: true, data: insertedData };
    }

    if (eventType === 'content_interaction') {
      const payload = {
        session_id: sessionId,
        content_id: data.content_id || null,
        content_type: data.content_type || 'audio',
        interaction_type: data.interaction_type || 'play',
        interacted_at: timestamp
      };

      const { data: insertedData, error } = await supabase
        .from('content_interactions')
        .insert(payload)
        .select();

      if (error) {
        console.error('❌ Error insertando content_interaction:', error);
        return { ok: false, error };
      }

      console.log('✅ Interacción registrada:', insertedData?.[0]?.id);
      return { ok: true, data: insertedData };
    }

    if (eventType === 'social_click') {
      const payload = {
        session_id: sessionId,
        platform: data.platform || null,
        link_url: data.url || null,
        page_source: data.page_url || window.location.pathname,
        clicked_at: timestamp
      };

      const { data: insertedData, error } = await supabase
        .from('social_media_clicks')
        .insert(payload)
        .select();

      if (error) {
        console.error('❌ Error insertando social_click:', error);
        return { ok: false, error };
      }

      console.log('✅ Click social registrado:', insertedData?.[0]?.id);
      return { ok: true, data: insertedData };
    }

    console.warn('⚠️ Tipo de evento no reconocido:', eventType);
    return { ok: false, error: 'unknown_event' };

  } catch (err) {
    console.error('❌ Error en trackEvent:', err);
    return { ok: false, error: err };
  }
}

// Hook para auto-tracking de páginas
export function usePageTracking() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🚀 Iniciando auto-tracking para:', window.location.pathname);
      
      trackEvent('page_view', {
        page_url: window.location.pathname,
        page_title: document.title,
        referrer_url: document.referrer
      });
    }
  }, []);
}