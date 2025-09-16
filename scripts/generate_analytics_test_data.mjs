import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseServiceKey = 'YOUR_SUPABASE_SERVICE_KEY'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Función para generar datos de prueba
async function generateTestAnalyticsData() {
  console.log('Iniciando generación de datos de prueba para analytics...')

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7) // Últimos 7 días

  // Países y ciudades de ejemplo
  const locations = [
    { country: 'Colombia', region: 'Bogotá DC', city: 'Bogotá', lat: 4.7110, lng: -74.0721 },
    { country: 'Colombia', region: 'Antioquia', city: 'Medellín', lat: 6.2442, lng: -75.5812 },
    { country: 'Mexico', region: 'CDMX', city: 'Ciudad de México', lat: 19.4326, lng: -99.1332 },
    { country: 'España', region: 'Madrid', city: 'Madrid', lat: 40.4168, lng: -3.7038 },
    { country: 'Argentina', region: 'Buenos Aires', city: 'Buenos Aires', lat: -34.6037, lng: -58.3816 },
    { country: 'Perú', region: 'Lima', city: 'Lima', lat: -12.0464, lng: -77.0428 }
  ]

  // Páginas del sitio
  const pages = [
    { path: '/', title: 'Inicio - Patrimonio Sonoro' },
    { path: '/explorar', title: 'Explorar Sonidos' },
    { path: '/campañas', title: 'Campañas' },
    { path: '/login', title: 'Iniciar Sesión' },
    { path: '/register', title: 'Registrarse' },
    { path: '/usuario', title: 'Perfil Usuario' },
    { path: '/dashboard', title: 'Dashboard Admin' }
  ]

  // Plataformas sociales
  const socialPlatforms = ['instagram', 'facebook', 'youtube', 'tiktok']

  // Generar sesiones de usuarios
  const sessions = []
  for (let i = 0; i < 200; i++) {
    const location = locations[Math.floor(Math.random() * locations.length)]
    const sessionDate = new Date(startDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)
    const sessionDuration = Math.floor(Math.random() * 1800) + 60 // 1-30 minutos
    
    const session = {
      session_id: `test_session_${i}_${Date.now()}`,
      ip_address: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      user_agent: 'Mozilla/5.0 (Test Analytics Data)',
      country: location.country,
      region: location.region,
      city: location.city,
      latitude: location.lat,
      longitude: location.lng,
      started_at: sessionDate.toISOString(),
      ended_at: new Date(sessionDate.getTime() + sessionDuration * 1000).toISOString(),
      duration_seconds: sessionDuration,
      is_active: Math.random() > 0.9 // 10% de sesiones activas
    }
    
    sessions.push(session)
  }

  console.log(`Insertando ${sessions.length} sesiones de prueba...`)
  const { error: sessionsError } = await supabase
    .from('user_sessions')
    .insert(sessions)

  if (sessionsError) {
    console.error('Error insertando sesiones:', sessionsError)
    return
  }

  // Generar vistas de página
  const pageViews = []
  for (const session of sessions) {
    const numPages = Math.floor(Math.random() * 5) + 1 // 1-5 páginas por sesión
    let currentTime = new Date(session.started_at)

    for (let j = 0; j < numPages; j++) {
      const page = pages[Math.floor(Math.random() * pages.length)]
      const viewDuration = Math.floor(Math.random() * 300) + 10 // 10-300 segundos
      
      pageViews.push({
        session_id: session.session_id,
        page_path: page.path,
        page_title: page.title,
        referrer: j === 0 ? 'https://google.com' : pages[Math.floor(Math.random() * pages.length)].path,
        viewed_at: currentTime.toISOString(),
        duration_seconds: viewDuration
      })

      currentTime = new Date(currentTime.getTime() + viewDuration * 1000)
    }
  }

  console.log(`Insertando ${pageViews.length} vistas de página...`)
  const { error: pageViewsError } = await supabase
    .from('page_views')
    .insert(pageViews)

  if (pageViewsError) {
    console.error('Error insertando vistas de página:', pageViewsError)
    return
  }

  // Generar interacciones con contenido
  const contentInteractions = []
  for (const session of sessions) {
    if (Math.random() > 0.3) { // 70% de sesiones interactúan con contenido
      const numInteractions = Math.floor(Math.random() * 3) + 1 // 1-3 interacciones
      
      for (let k = 0; k < numInteractions; k++) {
        const contentId = Math.floor(Math.random() * 8) + 1 // IDs 1-8 (contenidos existentes)
        const contentType = ['audio', 'video', 'image'][Math.floor(Math.random() * 3)]
        const interactionType = contentType === 'image' ? 'view' : 'play'
        const progress = contentType === 'image' ? 0 : Math.floor(Math.random() * 120) + 10
        const totalDuration = contentType === 'image' ? null : Math.floor(Math.random() * 300) + 60

        contentInteractions.push({
          session_id: session.session_id,
          content_id: contentId,
          content_type: contentType,
          interaction_type: interactionType,
          progress_seconds: progress,
          total_duration: totalDuration,
          interacted_at: new Date(Date.parse(session.started_at) + Math.random() * 1800000).toISOString()
        })
      }
    }
  }

  console.log(`Insertando ${contentInteractions.length} interacciones de contenido...`)
  const { error: interactionsError } = await supabase
    .from('content_interactions')
    .insert(contentInteractions)

  if (interactionsError) {
    console.error('Error insertando interacciones:', interactionsError)
    return
  }

  // Generar clics en redes sociales
  const socialClicks = []
  for (const session of sessions) {
    if (Math.random() > 0.7) { // 30% de sesiones hacen clic en redes sociales
      const platform = socialPlatforms[Math.floor(Math.random() * socialPlatforms.length)]
      const linkUrls = {
        instagram: 'https://www.instagram.com/patrimoniosonoro',
        facebook: 'https://www.facebook.com/share/1AYW6Q5TJu/',
        youtube: 'https://youtube.com/@patrimoniosonoro_audiobrand',
        tiktok: 'https://www.tiktok.com/@patrimonio.sonoro'
      }

      socialClicks.push({
        session_id: session.session_id,
        platform: platform,
        link_url: linkUrls[platform],
        page_source: pages[Math.floor(Math.random() * pages.length)].path,
        clicked_at: new Date(Date.parse(session.started_at) + Math.random() * 1800000).toISOString()
      })
    }
  }

  console.log(`Insertando ${socialClicks.length} clics en redes sociales...`)
  const { error: socialError } = await supabase
    .from('social_media_clicks')
    .insert(socialClicks)

  if (socialError) {
    console.error('Error insertando clics sociales:', socialError)
    return
  }

  // Generar eventos en tiempo real (últimos eventos)
  const realTimeEvents = []
  const currentTime = new Date()
  
  for (let i = 0; i < 50; i++) {
    const eventTime = new Date(currentTime.getTime() - Math.random() * 5 * 60 * 1000) // Últimos 5 minutos
    const eventTypes = ['page_view', 'content_play', 'social_click', 'user_join']
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    
    realTimeEvents.push({
      event_type: eventType,
      session_id: sessions[Math.floor(Math.random() * sessions.length)].session_id,
      data: {
        timestamp: eventTime.toISOString(),
        test_data: true
      },
      created_at: eventTime.toISOString()
    })
  }

  console.log(`Insertando ${realTimeEvents.length} eventos en tiempo real...`)
  const { error: eventsError } = await supabase
    .from('real_time_events')
    .insert(realTimeEvents)

  if (eventsError) {
    console.error('Error insertando eventos:', eventsError)
    return
  }

  console.log('✅ Datos de prueba generados correctamente!')
  console.log(`- ${sessions.length} sesiones`)
  console.log(`- ${pageViews.length} vistas de página`)
  console.log(`- ${contentInteractions.length} interacciones con contenido`)
  console.log(`- ${socialClicks.length} clics en redes sociales`)
  console.log(`- ${realTimeEvents.length} eventos en tiempo real`)
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  generateTestAnalyticsData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error:', error)
      process.exit(1)
    })
}

export { generateTestAnalyticsData }