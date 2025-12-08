// Utility functions for file handling
// This will be used for file upload functionality

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const ALLOWED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    }
  }

  // Check file type
  if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
    return {
      valid: false,
      error: 'Only PDF and DOCX files are allowed',
    }
  }

  return { valid: true }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// Future: AWS S3 upload function
export async function uploadToS3(file: File, userId: string): Promise<string> {
  // TODO: Implement S3 upload
  // This is a placeholder for future implementation

  const formData = new FormData()
  formData.append('file', file)
  formData.append('userId', userId)

  // For now, return a mock URL
  return `https://example.com/uploads/${userId}/${file.name}`
}

// Future: Generate signed URL for private files
export async function getSignedUrl(fileKey: string): Promise<string> {
  // TODO: Implement signed URL generation for S3
  return `https://example.com/files/${fileKey}`
}
