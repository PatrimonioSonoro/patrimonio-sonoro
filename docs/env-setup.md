Setup rápido de variables de entorno

1) Copia el ejemplo a .env.local

   cp .env.example .env.local

2) Abre `.env.local` y pega tus claves reales:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (MANTÉNLA PRIVADA)

3) Verifica localmente (dev):

   - Reinicia el servidor de dev: `npm run dev`
   - Inicia sesión con un usuario con role "user" (o usa el admin que creaste) desde la app
   - Accede a la página de usuario: http://localhost:3000/usuario

4) Comprobar la generación de signed URLs (opcional):

   - Usa la consola del navegador para obtener el access_token de la sesión (supabase.auth.getSession())
   - Llama al endpoint desde la terminal con curl (reemplaza TOKEN):

     curl -H "Authorization: Bearer TOKEN" "http://localhost:3000/api/usuario/contents?limit=1&expires=300"

   - Si `SUPABASE_SERVICE_ROLE_KEY` está configurada correctamente, la respuesta contendrá `*_signed_url` para assets privados.

Notas de seguridad

- Nunca publiques `SUPABASE_SERVICE_ROLE_KEY` en repositorios públicos.
- En producción, configura la variable en tu proveedor (Vercel, Fly, etc.) usando el panel de secretos.
- Considera usar short-lived signed URLs y CDN para assets públicos.
