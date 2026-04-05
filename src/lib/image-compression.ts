import imageCompression from 'browser-image-compression'

export interface CompressionOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  quality?: number
  preserveExif?: boolean
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxSizeMB: 1,
  maxWidthOrHeight: 2048,
  quality: 0.85,
  preserveExif: false,
}

const AVATAR_OPTIONS: Required<CompressionOptions> = {
  maxSizeMB: 0.3,
  maxWidthOrHeight: 512,
  quality: 0.8,
  preserveExif: false,
}

const LOGO_OPTIONS: Required<CompressionOptions> = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1024,
  quality: 0.9,
  preserveExif: false,
}

type CompressionPreset = 'product' | 'avatar' | 'logo' | 'blog'

const PRESETS: Record<CompressionPreset, Required<CompressionOptions>> = {
  product: DEFAULT_OPTIONS,
  avatar: AVATAR_OPTIONS,
  logo: LOGO_OPTIONS,
  blog: DEFAULT_OPTIONS,
}

export async function compressImage(
  file: File,
  preset: CompressionPreset = 'product',
  customOptions?: CompressionOptions
): Promise<File> {
  const opts = { ...PRESETS[preset], ...customOptions }

  // Skip compression for small files (under 200KB) or non-compressible formats
  if (file.size < 200 * 1024) {
    return file
  }

  // GIFs lose animation when compressed — skip
  if (file.type === 'image/gif') {
    return file
  }

  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: opts.maxSizeMB,
      maxWidthOrHeight: opts.maxWidthOrHeight,
      initialQuality: opts.quality,
      preserveExif: opts.preserveExif,
      useWebWorker: true,
      fileType: file.type as string,
    })

    // Only use compressed version if it's actually smaller
    if (compressed.size >= file.size) {
      return file
    }

    // Preserve original filename
    return new File([compressed], file.name, { type: compressed.type })
  } catch (error) {
    console.error('Image compression failed, using original:', error)
    return file
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
