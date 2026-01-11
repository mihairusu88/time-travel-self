import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getServerSupabaseClient } from '@/lib/supabase'

export const maxDuration = 60 // 1 minute timeout for upload

interface UploadRequestBody {
  file: string // base64 data URI
  folder?: string
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication - use @supabase/ssr for Next.js 15
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              // Ignore cookie setting errors in API routes
            }
          },
        },
      }
    )

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    console.log('🔐 User check:', {
      hasUser: !!user,
      userId: user?.id,
      error: userError,
    })

    if (!user) {
      console.error('❌ No user found - user not authenticated')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    const body = (await request.json()) as UploadRequestBody
    const { file, folder = 'images' } = body

    // Validate input
    if (!file || typeof file !== 'string') {
      return NextResponse.json(
        { error: "Invalid input: 'file' is required and must be a string" },
        { status: 400 }
      )
    }

    // Validate base64 data URI format
    if (!file.startsWith('data:')) {
      return NextResponse.json(
        { error: 'Invalid file format: must be a base64 data URI' },
        { status: 400 }
      )
    }

    console.log('📤 Starting server-side image upload for user:', userId)

    // Extract file information from base64 data URI
    const base64Data = file.split(',')[1]
    const mimeType = file.split(';')[0].split(':')[1]
    const extension = mimeType.split('/')[1]

    if (!base64Data || !mimeType || !extension) {
      return NextResponse.json(
        { error: 'Invalid data URI format' },
        { status: 400 }
      )
    }

    // Convert base64 to Buffer
    const buffer = Buffer.from(base64Data, 'base64')

    // Generate unique filename with user_id folder
    const fileName = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`

    console.log('📝 File info:', {
      mimeType,
      extension,
      size: `${(buffer.length / 1024).toFixed(2)} KB`,
      fileName,
    })

    // Upload to Supabase using server-side client
    const serverSupabase = getServerSupabaseClient()

    const { data, error } = await serverSupabase.storage
      .from('user_uploads')
      .upload(fileName, buffer, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('❌ Upload error:', error)
      return NextResponse.json(
        {
          error: 'Upload failed',
          details: error.message,
        },
        { status: 500 }
      )
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = serverSupabase.storage.from('user_uploads').getPublicUrl(data.path)

    console.log('✅ Upload successful:', publicUrl)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: data.path,
      message: 'Image uploaded successfully',
    })
  } catch (error: unknown) {
    const errorObj = error as { message?: string }
    console.error('❌ Upload failed:', error)

    return NextResponse.json(
      {
        error: 'Upload failed',
        details: errorObj.message || 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
