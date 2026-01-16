# Supabase Storage Setup

This document describes the storage buckets and policies for the Tenunan Songket e-commerce platform.

## Storage Buckets

### 1. Products Bucket (`products`)
- **Purpose:** Store product images
- **Public:** Yes
- **Max File Size:** 5MB
- **Allowed Types:** JPEG, PNG, WebP, GIF
- **Structure:** `{user_id}/{timestamp}_{random}_{filename}`

### 2. Avatars Bucket (`avatars`)
- **Purpose:** Store user profile pictures
- **Public:** Yes
- **Max File Size:** 5MB
- **Allowed Types:** JPEG, PNG, WebP
- **Structure:** `{user_id}/{timestamp}_{random}_{filename}`

### 3. Reviews Bucket (`reviews`)
- **Purpose:** Store review images uploaded by customers
- **Public:** Yes
- **Max File Size:** 5MB
- **Allowed Types:** JPEG, PNG, WebP, GIF
- **Structure:** `{user_id}/{timestamp}_{random}_{filename}`

## Setup Instructions

### Step 1: Create Buckets

Run this SQL in the Supabase SQL Editor:

\`\`\`sql
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
\`\`\`

### Step 2: Configure Storage Policies

#### Products Bucket Policies

\`\`\`sql
-- Public can view product images
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Authenticated users can upload product images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);

-- Users can update their own product images
CREATE POLICY "Users can update their own product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own product images
CREATE POLICY "Users can delete their own product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
\`\`\`

#### Avatars Bucket Policies

\`\`\`sql
-- Public can view avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
\`\`\`

#### Reviews Bucket Policies

\`\`\`sql
-- Public can view review images
CREATE POLICY "Public can view review images"
ON storage.objects FOR SELECT
USING (bucket_id = 'reviews');

-- Authenticated users can upload review images
CREATE POLICY "Authenticated users can upload review images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'reviews' 
  AND auth.role() = 'authenticated'
);

-- Users can update their own review images
CREATE POLICY "Users can update their own review images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'reviews' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own review images
CREATE POLICY "Users can delete their own review images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'reviews' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
\`\`\`

### Step 3: Configure Bucket Settings

In Supabase Dashboard:

1. Go to **Storage** > **Policies**
2. For each bucket, configure:
   - **File size limit:** 5MB
   - **Allowed MIME types:**
     - Products: `image/jpeg, image/png, image/webp, image/gif`
     - Avatars: `image/jpeg, image/png, image/webp`
     - Reviews: `image/jpeg, image/png, image/webp, image/gif`

## Usage Examples

### Upload Product Image

\`\`\`typescript
import { uploadFile, generateFilePath } from '@/lib/supabase/storage'

const file = event.target.files[0]
const userId = 'user-id'
const path = generateFilePath(userId, file.name, 'products')

const result = await uploadFile({
  bucket: 'products',
  path,
  file
})

if (result.success) {
  console.log('Image URL:', result.url)
}
\`\`\`

### Upload Avatar

\`\`\`typescript
import { uploadFile, generateFilePath } from '@/lib/supabase/storage'

const file = event.target.files[0]
const userId = 'user-id'
const path = generateFilePath(userId, file.name)

const result = await uploadFile({
  bucket: 'avatars',
  path,
  file,
  upsert: true // Replace existing avatar
})

if (result.success) {
  console.log('Avatar URL:', result.url)
}
\`\`\`

### Upload Review Images

\`\`\`typescript
import { uploadFiles, generateFilePath } from '@/lib/supabase/storage'

const files = Array.from(event.target.files)
const userId = 'user-id'

const uploads = files.map(file => ({
  bucket: 'reviews' as const,
  path: generateFilePath(userId, file.name, 'reviews'),
  file
}))

const results = await uploadFiles(uploads)
const successfulUploads = results.filter(r => r.success)
\`\`\`

### Delete File

\`\`\`typescript
import { deleteFile } from '@/lib/supabase/storage'

const success = await deleteFile('products', 'path/to/file.jpg')
\`\`\`

### Get Public URL

\`\`\`typescript
import { getPublicUrl } from '@/lib/supabase/storage'

const url = getPublicUrl('products', 'path/to/file.jpg')
\`\`\`

## File Naming Convention

Files are stored with the following naming pattern:
\`\`\`
{prefix}/{user_id}/{timestamp}_{random}_{sanitized_filename}
\`\`\`

Example:
\`\`\`
products/abc123/1704067200000_x7k9m2_songket_merah.jpg
avatars/abc123/1704067200000_p3q8n5_profile.jpg
reviews/abc123/1704067200000_z2w4r1_review_photo.jpg
\`\`\`

## Security Considerations

1. **File Size Limits:** Maximum 5MB per file
2. **MIME Type Validation:** Only allowed image types can be uploaded
3. **User Isolation:** Users can only modify their own files
4. **Public Access:** All buckets are public for read access
5. **Authentication Required:** Upload requires authenticated user

## Monitoring

Monitor storage usage in Supabase Dashboard:
- Go to **Storage** > **Usage**
- View total storage used
- View bandwidth usage
- View file counts per bucket

## Cleanup

To delete old or unused files:

\`\`\`typescript
import { listFiles, deleteFiles } from '@/lib/supabase/storage'

// List files in a folder
const files = await listFiles('products', 'user-id')

// Delete multiple files
await deleteFiles('products', files.map(f => \`user-id/\${f}\`))
\`\`\`

## Troubleshooting

### Upload fails with "File too large"
- Check file size is under 5MB
- Compress image before upload

### Upload fails with "Invalid file type"
- Verify file MIME type is allowed
- Check file extension matches content

### Permission denied
- Verify user is authenticated
- Check user owns the file path
- Verify storage policies are configured

### File not accessible
- Check bucket is public
- Verify file path is correct
- Check storage policies allow SELECT

## Best Practices

1. **Optimize Images:** Compress images before upload
2. **Use WebP:** Prefer WebP format for better compression
3. **Generate Thumbnails:** Create multiple sizes for responsive images
4. **Clean Up:** Delete unused files regularly
5. **Monitor Usage:** Track storage and bandwidth usage
6. **Validate Client-Side:** Check file size and type before upload
7. **Handle Errors:** Always handle upload failures gracefully
