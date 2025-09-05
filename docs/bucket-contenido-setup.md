# Configuración del Bucket 'Contenido' - Documentación

## ✅ Configuración Completada

### 🗂️ Estructura del Bucket
El bucket 'Contenido' está organizado con la siguiente estructura de directorios:

```
Contenido/
├── audios/          # Archivos de audio (.mp3, .wav, .m4a, etc.)
├── imagenes/        # Archivos de imagen (.jpg, .png, .gif, etc.)
└── videos/          # Archivos de video (.mp4, .webm, .mov, etc.)
```

### 🔐 Políticas de Storage Configuradas

#### 1. **SELECT (Lectura)**
- **Política**: "Allow authenticated users to read Contenido bucket"
- **Permiso**: Usuarios autenticados pueden leer todos los archivos
- **Condición**: `bucket_id = 'Contenido' AND auth.role() = 'authenticated'`

#### 2. **INSERT (Subida)**
- **Política**: "Allow authenticated users to upload to Contenido bucket"
- **Permiso**: Usuarios autenticados pueden subir archivos
- **Condición**: `bucket_id = 'Contenido' AND auth.role() = 'authenticated'`

#### 3. **UPDATE (Actualización)**
- **Política**: "Allow authenticated users to update their Contenido objects"
- **Permiso**: Usuarios pueden actualizar solo sus propios archivos
- **Condición**: `bucket_id = 'Contenido' AND auth.uid() = owner`

#### 4. **DELETE (Eliminación)**
- **Política**: "Allow authenticated users to delete their Contenido objects"
- **Permiso**: Usuarios pueden eliminar solo sus propios archivos
- **Condición**: `bucket_id = 'Contenido' AND auth.uid() = owner`

## 🚀 Cómo Funciona el Sistema

### Para Administradores:
1. **Subir Contenido**: 
   - Acceder a `/dashboard/contents/new`
   - Seleccionar archivos (audio/imagen/video)
   - Los archivos se organizan automáticamente en los directorios correspondientes
   - Se generan URLs públicas automáticamente

2. **Gestión**: 
   - Los archivos se suben con Service Role (permisos completos)
   - Se almacenan las rutas y URLs públicas en la DB

### Para Usuarios:
1. **Visualización**:
   - Acceder a `/usuario`
   - Ver contenido publicado con multimedia
   - Las imágenes, audios y videos se cargan directamente (bucket público)

## 🛠️ Scripts de Prueba Disponibles

### 1. **Verificar Estructura del Bucket**
```bash
node scripts/check_bucket_structure.mjs
```
Muestra la estructura de directorios y archivos en el bucket.

### 2. **Probar Políticas de Storage**
```bash
node scripts/test_storage_policies.mjs
```
Prueba las operaciones CRUD en el bucket con las políticas configuradas.

### 3. **Crear Contenido de Prueba**
```bash
node scripts/create_test_content.mjs
```
Crea contenido de prueba para verificar que todo funciona.

### 4. **Probar Bucket General**
```bash
node scripts/test_contenido_bucket.mjs
```
Prueba funcionalidad general del bucket.

## 📋 URLs de Acceso

### URLs Públicas
Los archivos en el bucket público tienen URLs del formato:
```
https://[PROJECT_ID].supabase.co/storage/v1/object/public/Contenido/[directory]/[filename]
```

Ejemplos:
- Audio: `https://[PROJECT_ID].supabase.co/storage/v1/object/public/Contenido/audios/audio-123.mp3`
- Imagen: `https://[PROJECT_ID].supabase.co/storage/v1/object/public/Contenido/imagenes/imagen-456.jpg`
- Video: `https://[PROJECT_ID].supabase.co/storage/v1/object/public/Contenido/videos/video-789.mp4`

## 🔧 Código Actualizado

### Archivos Modificados:
- `app/api/admin/upload/route.js` - Usa bucket 'Contenido' y organiza en directorios
- `app/api/admin/ensure-bucket/route.js` - Crea bucket 'Contenido' público
- `app/api/usuario/contents/route.js` - Genera URLs públicas para el bucket
- `app/api/usuario/signed-urls/route.js` - Usa bucket 'Contenido'
- `scripts/test_signed_url.mjs` - Actualizado para bucket 'Contenido'

### Nuevos Scripts:
- `scripts/check_bucket_structure.mjs` - Verificar estructura
- `scripts/test_storage_policies.mjs` - Probar políticas
- `scripts/create_test_content.mjs` - Crear contenido de prueba

## ✅ Beneficios de la Configuración

1. **Organización**: Archivos organizados por tipo en directorios específicos
2. **Seguridad**: Políticas RLS que controlan acceso según usuario y operación
3. **Rendimiento**: Bucket público permite acceso directo sin signed URLs
4. **Escalabilidad**: Estructura preparada para crecimiento del contenido
5. **Mantenibilidad**: Código organizado y scripts de prueba incluidos

## 🚨 Notas Importantes

- El bucket es **público**, ideal para contenido que quieres mostrar a usuarios
- Las políticas de Storage controlan quién puede subir/modificar/eliminar
- Solo usuarios autenticados pueden realizar operaciones
- Los usuarios solo pueden modificar/eliminar sus propios archivos
- Los administradores usan Service Role Key (permisos completos)
