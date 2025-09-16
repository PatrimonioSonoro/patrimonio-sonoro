import { supabase } from '../lib/supabaseClient';

// Función para verificar que el tracking está funcionando
export async function checkTrackingStatus() {
  try {
    const { count: sessions } = await supabase
      .from('user_sessions')
      .select('*', { count: 'exact', head: true });

    const { count: pageViews } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true });

    const { count: events } = await supabase
      .from('real_time_events')
      .select('*', { count: 'exact', head: true });

    console.log('📊 Estado del Tracking:');
    console.log(`- Sesiones registradas: ${sessions || 0}`);
    console.log(`- Vistas de página: ${pageViews || 0}`);
    console.log(`- Eventos en tiempo real: ${events || 0}`);

    return {
      sessions: sessions || 0,
      pageViews: pageViews || 0,
      events: events || 0,
      isWorking: (sessions || 0) > 0 || (pageViews || 0) > 0
    };
  } catch (error) {
    console.error('Error verificando tracking:', error);
    return { error: error.message };
  }
}

// Función para ver los últimos eventos capturados
export async function getLatestEvents() {
  try {
    const { data: latestSessions } = await supabase
      .from('user_sessions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(5);

    const { data: latestPageViews } = await supabase
      .from('page_views')
      .select('*')
      .order('viewed_at', { ascending: false })
      .limit(5);

    return {
      latestSessions,
      latestPageViews
    };
  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    return { error: error.message };
  }
}