import apiClient from '@/api/axios'

interface UploadResponse {
  url: string
  key: string
  bucket: string
}

interface PresignedUrlResponse {
  uploadUrl: string
  key: string
  publicUrl: string
}

class CloudflareR2Service {
  /**
   * Upload file to R2 through backend
   */
  async uploadFile(
    file: File,
    folder: string = 'videos',
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      // Increase timeout for large video files (5 minutes)
      const timeout = file.size > 50 * 1024 * 1024 ? 300000 : 120000

      const response = await apiClient.post(
        '/admin/media/upload',
        formData,
        {
          timeout,
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              onProgress(progress)
            }
          }
        }
      )

      return response.data.data.url
    } catch (error: any) {
      console.error('Error uploading file:', error)
      throw new Error(error.response?.data?.message || 'Failed to upload file')
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[],
    folder: string = 'videos',
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<string[]> {
    const uploadPromises = files.map((file, index) =>
      this.uploadFile(file, folder, (progress) => {
        if (onProgress) {
          onProgress(index, progress)
        }
      })
    )

    return Promise.all(uploadPromises)
  }

  /**
   * Delete file from R2
   */
  async deleteFile(fileKey: string): Promise<void> {
    try {
      await apiClient.post('/admin/media/delete', { key: fileKey })
    } catch (error: any) {
      console.error('Error deleting file:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete file')
    }
  }

  /**
   * Get file URL from key
   */
  getFileUrl(key: string): string {
    const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL
    if (!r2PublicUrl) {
      console.warn('R2 public URL not configured')
      return key
    }
    return `${r2PublicUrl}/${key}`
  }

  /**
   * Validate file for upload
   */
  validateFile(file: File, maxSizeMB: number = 100): { valid: boolean; error?: string } {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`
      }
    }

    // Check file type for videos
    const validVideoTypes = [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime',
      'video/x-msvideo'
    ]

    const validImageTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ]

    const allValidTypes = [...validVideoTypes, ...validImageTypes]

    if (!allValidTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload a video or image file.'
      }
    }

    return { valid: true }
  }
}

export const cloudflareR2Service = new CloudflareR2Service()
export default cloudflareR2Service
