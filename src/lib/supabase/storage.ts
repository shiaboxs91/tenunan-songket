import { createClient } from './client'

export type StorageBucket = 'products' | 'avatars' | 'reviews'

export interface UploadOptions {
  bucket: StorageBucket
  path: string
  file: File
  upsert?: boolean
}

export interface UploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile({
  bucket,
  path,
  file,
  upsert = false
}: UploadOptions): Promise<UploadResult> {
  const supabase = createClient()

  try {
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size exceeds 5MB limit'
      }
    }

    // Validate file type based on bucket
    const allowedTypes = getAllowedMimeTypes(bucket)
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      }
    }

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert
      })

    if (error) {
      console.error('Error uploading file:', error)
      return {
        success: false,
        error: error.message
      }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      success: true,
      url: publicUrl,
      path: data.path
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  uploads: UploadOptions[]
): Promise<UploadResult[]> {
  const results = await Promise.all(
    uploads.map(upload => uploadFile(upload))
  )
  return results
}

/**
 * Delete a file from storage
 */
export async function deleteFile(
  bucket: StorageBucket,
  path: string
): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Error deleting file:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}

/**
 * Delete multiple files
 */
export async function deleteFiles(
  bucket: StorageBucket,
  paths: string[]
): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths)

    if (error) {
      console.error('Error deleting files:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting files:', error)
    return false
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(
  bucket: StorageBucket,
  path: string
): string {
  const supabase = createClient()
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

/**
 * List files in a bucket folder
 */
export async function listFiles(
  bucket: StorageBucket,
  folder: string = ''
): Promise<string[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder)

    if (error) {
      console.error('Error listing files:', error)
      return []
    }

    return data?.map(file => file.name) || []
  } catch (error) {
    console.error('Error listing files:', error)
    return []
  }
}

/**
 * Get allowed MIME types for a bucket
 */
function getAllowedMimeTypes(bucket: StorageBucket): string[] {
  switch (bucket) {
    case 'products':
    case 'reviews':
      return [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif'
      ]
    case 'avatars':
      return [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
      ]
    default:
      return []
  }
}

/**
 * Generate unique file path
 */
export function generateFilePath(
  userId: string,
  fileName: string,
  prefix: string = ''
): string {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const extension = fileName.split('.').pop()
  const sanitizedName = fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\s+/g, '_')
  
  if (prefix) {
    return `${prefix}/${userId}/${timestamp}_${randomStr}_${sanitizedName}`
  }
  
  return `${userId}/${timestamp}_${randomStr}_${sanitizedName}`
}

/**
 * Create storage buckets (run once during setup)
 * This should be run from Supabase SQL Editor or via API
 */
export const STORAGE_BUCKET_SETUP_SQL = `
-- Create products bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Create avatars bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create reviews bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('reviews', 'reviews', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for products bucket
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for avatars bucket
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for reviews bucket
CREATE POLICY "Public can view review images"
ON storage.objects FOR SELECT
USING (bucket_id = 'reviews');

CREATE POLICY "Authenticated users can upload review images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'reviews' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own review images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'reviews' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own review images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'reviews' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
`
