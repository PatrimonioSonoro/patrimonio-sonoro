# Google Analytics 4 - Integración en Patrimonio Sonoro

## 📊 Descripción

Este documento explica la integración completa de Google Analytics 4 (GA4) en el sitio web Patrimonio Sonoro, implementada con Next.js 15.

## 🏗️ Arquitectura de la implementación

### 1. Componente GoogleAnalytics
**Ubicación**: `app/components/GoogleAnalytics.jsx`

- Utiliza el componente `Script` de Next.js para carga optimizada
- Estrategia `afterInteractive` para no bloquear la carga inicial
- Carga condicional basada en variable de entorno
- Manejo de errores y advertencias en desarrollo

### 2. Funciones auxiliares de tracking
**Ubicación**: `lib/googleAnalytics.js`

Funciones disponibles:
- `trackEvent()` - Eventos personalizados
- `trackPageView()` - Vistas de página
- `trackMediaInteraction()` - Interacciones con contenido multimedia
- `trackSocialClick()` - Clicks en redes sociales
- `trackDownload()` - Descargas de archivos
- `trackFormSubmission()` - Envío de formularios
- `trackSearch()` - Búsquedas
- `trackTimeOnPage()` - Tiempo en página

## ⚙️ Configuración

### Variables de entorno
Agrega en `.env.local`:
```bash
NEXT_PUBLIC_GA_ID=G-H8G97Y5WDH
```

### Integración en layout
El componente se carga en `app/layout.js` como primer elemento del `<body>` para asegurar disponibilidad temprana.

## 🚀 Uso práctico

### Tracking automático
- **Page Views**: Se trackean automáticamente en cada navegación
- **Eventos del sistema**: Configurados automáticamente por GA4

### Tracking manual de eventos
```javascript
import { trackMediaInteraction, trackSocialClick } from '../lib/googleAnalytics';

// Ejemplo: Tracking de reproducción de audio
const handlePlayAudio = (contentId, title) => {
  trackMediaInteraction(contentId, title, 'play', 'audio');
};

// Ejemplo: Tracking de click en red social
const handleSocialClick = () => {
  trackSocialClick('instagram', 'https://instagram.com/patrimoniosonoro');
};
```

## 📈 Eventos configurados

### 1. Media Interactions
- `content_id`: ID del contenido
- `content_title`: Título del contenido  
- `content_type`: Tipo (audio, video, image)
- `action`: Acción (play, pause, stop)

### 2. Social Clicks
- `platform`: Plataforma (instagram, facebook, youtube, tiktok)
- `url`: URL del enlace
- `event_category`: 'social_media'

### 3. Form Submissions
- `form_name`: Nombre del formulario
- `success`: Si fue exitoso
- `event_category`: 'forms'

## 🔍 Verificación y debugging

### En desarrollo
1. **Consola del navegador**: Busca mensajes como `📈 GA Event: event_name`
2. **Network tab**: Verifica requests a `https://www.google-analytics.com/`
3. **Google Analytics**: Ve a "Tiempo Real" para ver eventos en vivo

### Verificación de implementación
```javascript
// Verificar si GA está disponible
import { isGAAvailable } from '../lib/googleAnalytics';

if (isGAAvailable()) {
  console.log('✅ Google Analytics está configurado correctamente');
} else {
  console.warn('⚠️ Google Analytics no está disponible');
}
```

## 🎯 Métricas clave a monitorear

### Engagement de contenido
- Reproducciones de audio/video
- Tiempo de escucha
- Contenido más popular

### Interacciones sociales
- Clicks por plataforma
- Contenido más compartido
- Tráfico de referencia social

### Comportamiento del usuario
- Páginas más visitadas
- Tiempo en sitio
- Rutas de navegación

## 🛡️ Privacidad y cumplimiento

- **GDPR**: GA4 cumple automáticamente con GDPR
- **Anonymización**: Los datos se anonimizan por defecto
- **Cookies**: GA4 puede funcionar sin cookies de terceros
- **Consentimiento**: Se puede integrar con banners de consentimiento si es necesario

## 🔧 Mantenimiento

### Actualizaciones
- El ID de Google Analytics está en variables de entorno
- Las funciones de tracking son modulares y reutilizables
- Fácil extensión para nuevos tipos de eventos

### Monitoring
- Logs en consola para debugging
- Manejo de errores robusto
- Verificación de disponibilidad antes de enviar eventos

## 📱 Compatibilidad

- ✅ Next.js 15 con App Router
- ✅ Server-side rendering (SSR)
- ✅ Client-side navigation
- ✅ Mobile y desktop
- ✅ Todos los navegadores modernos

## 🎉 ¡Listo para usar!

La integración está completamente configurada y lista. Los datos comenzarán a aparecer en Google Analytics inmediatamente después del deploy.