-- Setup storage policies for authenticated admin users
-- This allows authenticated users with admin role to upload to the Contenido bucket

-- First, make sure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated admin users to INSERT into Contenido bucket
DROP POLICY IF EXISTS "Admin users can upload to Contenido bucket" ON storage.objects;
CREATE POLICY "Admin users can upload to Contenido bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'Contenido' AND 
  auth.uid() IS NOT NULL AND
  (
    -- Allow if user is admin (check via RPC)
    EXISTS (
      SELECT 1 FROM auth.users u 
      WHERE u.id = auth.uid() 
      AND u.raw_app_meta_data->>'is_admin' = 'true'
    )
    OR
    -- Fallback: check via RPC function if it exists
    (
      SELECT COALESCE(
        (SELECT is_admin(auth.uid())), 
        false
      )
    )
  )
);

-- Policy: Allow authenticated admin users to UPDATE in Contenido bucket
DROP POLICY IF EXISTS "Admin users can update in Contenido bucket" ON storage.objects;
CREATE POLICY "Admin users can update in Contenido bucket"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'Contenido' AND 
  auth.uid() IS NOT NULL AND
  (
    -- Allow if user is admin
    EXISTS (
      SELECT 1 FROM auth.users u 
      WHERE u.id = auth.uid() 
      AND u.raw_app_meta_data->>'is_admin' = 'true'
    )
    OR
    -- Fallback: check via RPC function if it exists
    (
      SELECT COALESCE(
        (SELECT is_admin(auth.uid())), 
        false
      )
    )
  )
);

-- Policy: Allow authenticated admin users to DELETE from Contenido bucket
DROP POLICY IF EXISTS "Admin users can delete from Contenido bucket" ON storage.objects;
CREATE POLICY "Admin users can delete from Contenido bucket"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'Contenido' AND 
  auth.uid() IS NOT NULL AND
  (
    -- Allow if user is admin
    EXISTS (
      SELECT 1 FROM auth.users u 
      WHERE u.id = auth.uid() 
      AND u.raw_app_meta_data->>'is_admin' = 'true'
    )
    OR
    -- Fallback: check via RPC function if it exists
    (
      SELECT COALESCE(
        (SELECT is_admin(auth.uid())), 
        false
      )
    )
  )
);

-- Policy: Allow anyone to SELECT from Contenido bucket (for signed URLs)
DROP POLICY IF EXISTS "Anyone can view Contenido bucket objects" ON storage.objects;
CREATE POLICY "Anyone can view Contenido bucket objects"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'Contenido');

-- Ensure the bucket exists and is private
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'Contenido', 
  'Contenido', 
  false,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-wav', 'audio/aac']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-wav', 'audio/aac'];
