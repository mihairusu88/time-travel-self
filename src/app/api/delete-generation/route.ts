import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getServerSupabaseClient } from '@/lib/supabase'
import { deleteFromStorage } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
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
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { generationId } = body

    if (!generationId) {
      return NextResponse.json(
        { error: 'generationId is required' },
        { status: 400 }
      )
    }

    // Get the generation to verify ownership and get image URLs
    const generation = await prisma.generation.findUnique({
      where: {
        id: generationId,
        userId: user.id,
      },
    })

    if (!generation) {
      return NextResponse.json(
        { error: 'Generation not found' },
        { status: 404 }
      )
    }

    const serverSupabase = getServerSupabaseClient()

    // Delete generated image from storage if it exists
    if (generation.imageUrl) {
      try {
        // Extract path from URL
        const urlParts = generation.imageUrl.split('/user_generations/')
        if (urlParts.length > 1) {
          const filePath = urlParts[1]
          await deleteFromStorage(filePath, 'user_generations', serverSupabase)
          console.log('✅ Deleted generated image from storage')
        }
      } catch (error) {
        console.error('⚠️  Failed to delete generated image:', error)
        // Continue with deletion even if storage cleanup fails
      }
    }

    // Delete uploaded image from storage if it exists
    if (generation.uploadedImageUrl) {
      try {
        // Extract path from URL
        const urlParts = generation.uploadedImageUrl.split('/user_uploads/')
        if (urlParts.length > 1) {
          const filePath = urlParts[1]
          await deleteFromStorage(filePath, 'user_uploads', serverSupabase)
          console.log('✅ Deleted uploaded image from storage')
        }
      } catch (error) {
        console.error('⚠️  Failed to delete uploaded image:', error)
        // Continue with deletion even if storage cleanup fails
      }
    }

    // Delete the generation record from database
    await prisma.generation.delete({
      where: {
        id: generationId,
      },
    })

    console.log('✅ Generation deleted successfully:', generationId)

    return NextResponse.json({
      success: true,
      message: 'Generation deleted successfully',
    })
  } catch (error) {
    console.error('Error in POST /api/delete-generation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
