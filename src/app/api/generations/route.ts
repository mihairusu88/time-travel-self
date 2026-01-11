import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Fetch user's generations with pagination
export async function GET(request: NextRequest) {
  try {
    // Use @supabase/ssr for Next.js 15
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

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get pagination parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // Get total count
    const totalCount = await prisma.generation.count({
      where: {
        userId: user.id,
      },
    })

    // Fetch generations using Prisma with pagination
    const generations = await prisma.generation.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    })

    // Transform to match expected format (camelCase to snake_case for frontend)
    const formattedGenerations = generations.map(gen => ({
      id: gen.id,
      title: gen.title,
      status: gen.status,
      image_url: gen.imageUrl,
      uploaded_image_url: gen.uploadedImageUrl,
      selected_props: gen.selectedProps,
      selected_template: gen.selectedTemplate,
      error: gen.error,
      file_size: gen.fileSize,
      prediction_id: gen.predictionId,
      created_at: gen.createdAt.toISOString(),
      updated_at: gen.updatedAt.toISOString(),
    }))

    const hasMore = skip + generations.length < totalCount

    return NextResponse.json({
      generations: formattedGenerations,
      pagination: {
        page,
        limit,
        total: totalCount,
        hasMore,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/generations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new generation record
export async function POST(request: NextRequest) {
  try {
    // Use @supabase/ssr for Next.js 15
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

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      image_url,
      uploaded_image_url,
      selected_props,
      selected_template,
    } = body

    if (!image_url) {
      return NextResponse.json(
        { error: 'image_url is required' },
        { status: 400 }
      )
    }

    // Insert generation record using Prisma
    const generation = await prisma.generation.create({
      data: {
        userId: user.id,
        title,
        imageUrl: image_url,
        uploadedImageUrl: uploaded_image_url,
        selectedProps: selected_props,
        selectedTemplate: selected_template,
      },
    })

    return NextResponse.json({ generation })
  } catch (error) {
    console.error('Error in POST /api/generations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a generation
export async function DELETE(request: NextRequest) {
  try {
    // Use @supabase/ssr for Next.js 15
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

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    // Delete generation using Prisma (ensure user owns it)
    await prisma.generation.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/generations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
