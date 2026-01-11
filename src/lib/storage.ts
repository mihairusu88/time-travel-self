import { SupabaseClient } from '@supabase/supabase-js'
import { supabase, getServerSupabaseClient } from './supabase'

export interface UploadResult {
  url?: string
  path?: string
  error?: string
}

/**
 * Upload a file to Supabase storage
 * @param file - File, base64 data URI, or Buffer to upload
 * @param bucket - Storage bucket name (default: 'user_uploads')
 * @param folder - Optional folder path within bucket
 * @param supabaseClient - Optional Supabase client instance (defaults to client-side)
 * @returns Public URL and storage path
 */
export const uploadToStorage = async (
  file: File | string | Buffer,
  bucket: string = 'user_uploads',
  folder: string = 'images',
  supabaseClient?: SupabaseClient
): Promise<UploadResult> => {
  const client = supabaseClient || supabase
  try {
    let fileToUpload: File | Blob
    let fileName: string

    if (Buffer.isBuffer(file)) {
      // Handle Buffer (from server-side downloads)
      fileToUpload = new Blob([new Uint8Array(file)], { type: 'image/png' })
      fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.png`
    } else if (typeof file === 'string' && file.startsWith('data:')) {
      // Handle base64 data URI
      const base64Data = file.split(',')[1]
      const mimeType = file.split(';')[0].split(':')[1]
      const extension = mimeType.split('/')[1]

      // Convert base64 to Blob
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      fileToUpload = new Blob([byteArray], { type: mimeType })

      // Generate unique filename
      fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`
    } else if (file instanceof File) {
      // Handle File object
      fileToUpload = file
      fileName = `${folder}/${Date.now()}-${file.name}`
    } else {
      return { error: 'Invalid file input type' }
    }

    // Upload to Supabase storage
    const { data, error } = await client.storage
      .from(bucket)
      .upload(fileName, fileToUpload, {
        contentType: Buffer.isBuffer(file) ? 'image/png' : undefined,
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return { error: error.message }
    }

    // Get public URL
    const { data: publicUrlData } = client.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      url: publicUrlData.publicUrl,
      path: data.path,
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Delete a file from Supabase storage
 * @param path - File path in storage
 * @param bucket - Storage bucket name (default: 'user_uploads')
 * @param supabaseClient - Optional Supabase client instance (defaults to client-side)
 */
export const deleteFromStorage = async (
  path: string,
  bucket: string = 'user_uploads',
  supabaseClient?: SupabaseClient
): Promise<{ success: boolean; error?: string }> => {
  const client = supabaseClient || supabase

  try {
    const { error } = await client.storage.from(bucket).remove([path])

    if (error) {
      console.error('Delete error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
