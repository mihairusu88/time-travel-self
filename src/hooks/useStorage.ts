import { useState } from 'react'
import {
  uploadToStorage,
  deleteFromStorage,
  type UploadResult,
} from '@/lib/storage'

export const useStorage = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string>('')

  const uploadFile = async (
    file: File | string,
    bucket?: string,
    folder?: string
  ): Promise<UploadResult> => {
    setUploading(true)
    setUploadError('')
    setUploadProgress(0)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const result = await uploadToStorage(file, bucket, folder)

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (result.error) {
        setUploadError(result.error)
      }

      return result
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed'
      setUploadError(errorMessage)
      return {
        url: '',
        path: '',
        error: errorMessage,
      }
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const deleteFile = async (path: string, bucket?: string) => {
    try {
      const result = await deleteFromStorage(path, bucket)
      if (result.error) {
        setUploadError(result.error)
      }
      return result
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Delete failed'
      setUploadError(errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  return {
    uploading,
    uploadProgress,
    uploadError,
    uploadFile,
    deleteFile,
  }
}
