import imageCompression from 'browser-image-compression'

export async function compressImage(file: File): Promise<File> {
  try {
    return await imageCompression(file, {
      maxSizeMB: 0.4,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
      fileType: 'image/webp',
    })
  } catch {
    return file
  }
}

export function randomFileName(originalName: string) {
  const ext = originalName.includes('.') ? originalName.split('.').pop() : 'jpg'
  return `${crypto.randomUUID()}.${ext}`
}
