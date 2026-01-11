import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getServerSupabaseClient } from '@/lib/supabase'
import { uploadToStorage, deleteFromStorage } from '@/lib/storage'
import { getTemplates } from '@/lib/templatesLoader'
import { IMAGE_SIZES, type ImageSize } from '@/constants/imageSettings'
import { prisma } from '@/lib/prisma'
import { canUserGenerate, incrementGenerationCount } from '@/lib/subscription'
import { GENERATE_PROMPTS } from '@/constants/generatePrompts'

export const maxDuration = 300 // 5 minutes timeout for generation

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
})

interface SelectedProp {
  id: string
  name: string
  image: string
  position: string
}

interface GenerationOptions {
  size: ImageSize
  aspectRatio: '1:1' | '4:3' | '3:4' | '16:9' | '9:16'
  width: number
  height: number
  prompt: string
}

interface RequestBody {
  uploadedImage: string
  uploadedImagePath?: string
  selectedProps: SelectedProp[]
  selectedTemplate?: string
  options?: GenerationOptions
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

    const userId = user.id

    // Check if user can generate (has remaining generations)
    const canGenerate = await canUserGenerate(userId)

    if (!canGenerate) {
      return NextResponse.json(
        {
          error: 'Generation limit exceeded',
          message:
            'You have reached your monthly generation limit. Please upgrade your plan to continue.',
          code: 'LIMIT_EXCEEDED',
        },
        { status: 403 }
      )
    }

    // Get user's plan to determine image quality
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    })

    const userPlan = dbUser?.plan || 'free'
    console.log('👤 User plan:', userPlan)

    // Validate API key is configured
    if (!process.env.REPLICATE_API_KEY) {
      console.error('❌ REPLICATE_API_KEY not configured')
      return NextResponse.json(
        {
          error: 'Server configuration error',
          details:
            'REPLICATE_API_KEY not configured. Please check server configuration.',
        },
        { status: 500 }
      )
    }

    const body = (await request.json()) as RequestBody
    const {
      uploadedImage,
      uploadedImagePath,
      selectedProps,
      selectedTemplate,
      options,
    } = body

    // Input validation
    if (!uploadedImage || typeof uploadedImage !== 'string') {
      return NextResponse.json(
        {
          error:
            "Invalid input: 'uploadedImage' is required and must be a string",
        },
        { status: 400 }
      )
    }

    console.log('🎨 Starting image generation')
    console.log('📊 User image URL:', uploadedImage.substring(0, 100) + '...')
    console.log('📊 Selected props count:', selectedProps?.length || 0)
    console.log('📊 Selected template:', selectedTemplate || 'none')

    const prompt = options?.prompt || GENERATE_PROMPTS.default

    console.log('📝 Using SeeDream-4 with hardcoded prompt')
    console.log('📝 Prompt length:', prompt?.length, 'characters')

    // Build image_input array dynamically
    const imageInputArray: string[] = []

    // Add user uploaded image (always first)
    imageInputArray.push(uploadedImage)
    console.log('📸 Added user image to input array')

    // Add selected template image if provided
    if (selectedTemplate) {
      const templateCategories = await getTemplates()
      const template = templateCategories
        .flatMap(cat => cat.templates)
        .find(t => t.id === selectedTemplate)

      if (template?.image) {
        imageInputArray.push(template.image)
        console.log('🎭 Added template image:', template.name)
      }
    }

    // Add selected props images
    if (selectedProps && selectedProps.length > 0) {
      selectedProps.forEach(prop => {
        if (prop.image) {
          imageInputArray.push(prop.image)
          console.log(
            '🎨 Added prop image:',
            prop.name,
            'at position:',
            prop.position
          )
        }
      })
    }

    console.log('📊 Total images in input array:', imageInputArray.length)

    // Create a generation record BEFORE starting the prediction
    console.log('💾 Creating generation record...')
    const generation = await prisma.generation.create({
      data: {
        userId,
        status: 'starting',
        uploadedImageUrl: uploadedImage,
        selectedProps: selectedProps
          ? (selectedProps as unknown as import('@prisma/client/runtime/library').InputJsonValue)
          : undefined,
        selectedTemplate: selectedTemplate,
      },
    })

    console.log('✅ Generation record created:', generation.id)

    // Determine image parameters based on user plan and provided options
    let imageSize: string
    let imageWidth: number
    let imageHeight: number
    let aspectRatio: string

    // Helper to get dimensions from size using constants
    const getDimensionsFromSize = (sizeValue: ImageSize): number => {
      const sizeConfig = IMAGE_SIZES.find(s => s.value === sizeValue)
      if (!sizeConfig || sizeConfig.value === 'custom') return 2048
      return parseInt(sizeConfig.dimensions.split('x')[0])
    }

    if (userPlan === 'free') {
      // Free plan: forced to 1K, 4:3
      imageSize = '1K'
      imageWidth = getDimensionsFromSize('1K')
      imageHeight = getDimensionsFromSize('1K')
      aspectRatio = '4:3'
      console.log('📏 Free plan: using default settings (1K, 4:3)')
    } else if (userPlan === 'pro') {
      // Pro plan: can modify size (1K, 2K only) and aspect ratio
      // 4K and Custom are not allowed for Pro users
      const requestedSize = options?.size || '2K'

      if (requestedSize === 'custom' || requestedSize === '4K') {
        console.log(
          `⚠️  Pro user attempted ${requestedSize} size, defaulting to 2K`
        )
        imageSize = '2K'
      } else {
        imageSize = requestedSize
      }

      aspectRatio = options?.aspectRatio || '4:3'

      // Set dimensions based on size (maintaining aspect ratio via Replicate)
      const baseDimension = getDimensionsFromSize(imageSize as ImageSize)
      imageWidth = baseDimension
      imageHeight = baseDimension

      console.log(`📏 Pro plan: ${imageSize}, ${aspectRatio}`)
    } else if (userPlan === 'premium') {
      // Premium plan: full control including custom dimensions
      imageSize = options?.size || '2K'
      aspectRatio = options?.aspectRatio || '4:3'

      // If custom size, use provided width/height
      if (imageSize === 'custom') {
        imageWidth = options?.width || 2048
        imageHeight = options?.height || 2048
        console.log(
          `📏 Premium plan (custom): ${aspectRatio}, ${imageWidth}x${imageHeight}`
        )
      } else {
        // Use preset dimensions
        const baseDimension = getDimensionsFromSize(imageSize as ImageSize)
        imageWidth = baseDimension
        imageHeight = baseDimension
        console.log(
          `📏 Premium plan (preset): ${imageSize}, ${aspectRatio}, ${imageWidth}x${imageHeight}`
        )
      }
    } else {
      // Fallback to 2K
      imageSize = '2K'
      imageWidth = getDimensionsFromSize('2K')
      imageHeight = getDimensionsFromSize('2K')
      aspectRatio = '4:3'
    }

    // Run the Replicate model using SeeDream-4
    console.log('🚀 Running SeeDream-4 model...')
    const input = {
      size: imageSize,
      width: imageWidth,
      height: imageHeight,
      prompt: prompt,
      max_images: 1,
      image_input: imageInputArray,
      aspect_ratio: aspectRatio,
      sequential_image_generation: 'disabled',
    }

    console.log('📊 SeeDream-4 input parameters:', {
      size: input.size,
      width: input.width,
      height: input.height,
      prompt: input.prompt.substring(0, 100) + '...',
      max_images: input.max_images,
      image_input_count: input.image_input.length,
      aspect_ratio: input.aspect_ratio,
    })

    const prediction = await replicate.predictions.create({
      version: 'bytedance/seedream-4',
      input: input,
    })

    console.log('🆔 Prediction ID:', prediction.id)

    // Update generation record with prediction ID
    await prisma.generation.update({
      where: { id: generation.id },
      data: {
        status: 'processing',
        predictionId: prediction.id,
      },
    })

    // Wait for the prediction to complete
    console.log('⏳ Waiting for prediction to complete...')
    const completedPrediction = await replicate.wait(prediction)

    console.log('✅ Replicate prediction completed')
    console.log('📤 Prediction status:', completedPrediction.status)

    // Extract output from the prediction object
    const output = completedPrediction.output

    console.log('📤 Raw output type:', typeof output)
    console.log('📤 Is Array:', Array.isArray(output))

    // Additional debugging
    if (output && typeof output === 'object') {
      console.log(
        '📤 Output constructor:',
        (output as { constructor?: { name: string } }).constructor?.name
      )
      console.log('📤 Has url property:', 'url' in output)
      if ('url' in output) {
        console.log(
          '📤 URL property type:',
          typeof (output as { url: unknown }).url
        )
      }
    }

    // Handle output according to Replicate documentation
    // The Replicate Node.js SDK returns FileOutput objects that need special handling
    let imageUrl: string | undefined

    try {
      if (typeof output === 'string') {
        // Direct string URL
        console.log('📍 Output is a direct string')
        imageUrl = output
      } else if (Array.isArray(output) && output.length > 0) {
        console.log('📍 Output is an array with', output.length, 'items')
        // Array of outputs - take the first one
        const firstItem = output[0]
        console.log('📍 First item type:', typeof firstItem)

        if (typeof firstItem === 'string') {
          imageUrl = firstItem
        } else if (
          firstItem &&
          typeof firstItem === 'object' &&
          'url' in firstItem
        ) {
          console.log('📍 First item has url property, calling it...')
          // FileOutput object with url() method - call it
          const urlResult = await (
            firstItem as { url: () => Promise<string> }
          ).url()
          console.log('📍 URL result:', urlResult, 'type:', typeof urlResult)
          imageUrl = String(urlResult)
        } else {
          console.error('📍 First item unexpected:', firstItem)
          throw new Error('Unexpected item type in output array')
        }
      } else if (output && typeof output === 'object' && 'url' in output) {
        console.log('📍 Output is an object with url property')
        // Single FileOutput object with url() method - call it
        const urlResult = await (output as { url: () => Promise<string> }).url()
        console.log('📍 URL result:', urlResult, 'type:', typeof urlResult)
        imageUrl = String(urlResult)
      } else {
        console.error('📍 Output format not recognized')
        throw new Error(
          `Unexpected output format from Replicate. Type: ${typeof output}, isArray: ${Array.isArray(output)}`
        )
      }
    } catch (urlError) {
      console.error('❌ Error extracting URL:', urlError)
      throw urlError
    }

    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.length === 0) {
      console.error('❌ Invalid imageUrl:', imageUrl, 'type:', typeof imageUrl)
      throw new Error('Failed to extract valid image URL from output')
    }

    console.log(
      '🎉 Image URL extracted successfully:',
      imageUrl.substring(0, 100) + (imageUrl.length > 100 ? '...' : '')
    )

    // Save generated image to Supabase storage using existing utility
    console.log('💾 Saving generated image to Supabase storage...')
    let supabaseImageUrl = imageUrl // Fallback to original URL if save fails
    let fileSize: string | undefined

    try {
      // Download image from Replicate
      console.log('📥 Downloading image from Replicate...')
      const imageResponse = await fetch(imageUrl)

      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.statusText}`)
      }

      const imageBuffer = await imageResponse.arrayBuffer()
      const buffer = Buffer.from(imageBuffer)

      // Calculate file size
      const bytes = buffer.length
      if (bytes < 1024) {
        fileSize = `${bytes} B`
      } else if (bytes < 1024 * 1024) {
        fileSize = `${(bytes / 1024).toFixed(1)} KB`
      } else {
        fileSize = `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      }

      console.log(
        `📊 Image downloaded: ${(buffer.length / 1024 / 1024).toFixed(2)} MB (${fileSize})`
      )

      // Use existing uploadToStorage utility with user_id folder
      const serverSupabase = getServerSupabaseClient()
      const uploadResult = await uploadToStorage(
        buffer,
        'user_generations',
        `${userId}/images`,
        serverSupabase
      )

      if (uploadResult.error || !uploadResult.url) {
        console.error('❌ Supabase upload failed:', uploadResult.error)
        throw new Error(uploadResult.error || 'Upload failed')
      }

      supabaseImageUrl = uploadResult.url
      console.log('✅ Image saved to Supabase:', uploadResult.url)

      // Delete uploaded image from user_uploads bucket after successful generation
      if (uploadedImagePath) {
        console.log('🗑️  Deleting uploaded image from user_uploads...')
        const deleteResult = await deleteFromStorage(
          uploadedImagePath,
          'user_uploads',
          serverSupabase
        )

        if (deleteResult.success) {
          console.log('✅ Uploaded image deleted successfully')
        } else {
          console.error(
            '⚠️  Failed to delete uploaded image:',
            deleteResult.error
          )
          // Continue - don't fail the request if cleanup fails
        }
      }
    } catch (saveError) {
      console.error('⚠️  Failed to save to Supabase:', saveError)
      console.log('📍 Using original Replicate URL as fallback')
      // Continue with original URL - don't fail the request
    }

    // Update generation record with final result
    try {
      console.log('💾 Updating generation record with result...')
      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          imageUrl: supabaseImageUrl,
          fileSize: fileSize,
          status: 'succeeded',
        },
      })

      console.log('✅ Generation record updated')
    } catch (dbError) {
      console.error('⚠️  Error updating generation:', dbError)
      // Continue - don't fail the request
    }

    // Increment user's generation count
    try {
      await incrementGenerationCount(userId)
      console.log('✅ Generation count incremented')
    } catch (countError) {
      console.error('⚠️  Error incrementing generation count:', countError)
      // Continue - don't fail the request
    }

    return NextResponse.json({
      status: 'success',
      generationId: generation.id,
      output: supabaseImageUrl,
      imageUrl: supabaseImageUrl, // Supabase URL or fallback to Replicate URL
      replicateUrl: imageUrl, // Keep original Replicate URL for reference
      message: 'Image generated successfully!',
    })
  } catch (error: unknown) {
    const errorObj = error as {
      status?: number
      message?: string
      detail?: string
      error?: string
    }
    console.error('❌ Image generation failed:', error)

    // Update generation record with error if it exists
    try {
      const errorDetails =
        error instanceof Error ? error.message : 'Unknown error occurred'

      // Try to find a generation record that might exist
      const userId = await (async () => {
        try {
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
          return user?.id
        } catch {
          return null
        }
      })()

      if (userId) {
        // Find the most recent 'starting' or 'processing' generation for this user
        const recentGeneration = await prisma.generation.findFirst({
          where: {
            userId,
            status: { in: ['starting', 'processing'] },
          },
          orderBy: { createdAt: 'desc' },
        })

        if (recentGeneration) {
          await prisma.generation.update({
            where: { id: recentGeneration.id },
            data: {
              status: 'failed',
              error: errorDetails,
            },
          })
          console.log('✅ Generation record updated with error')
        }
      }
    } catch (dbError) {
      console.error('⚠️  Error updating generation with error:', dbError)
    }

    // Handle Replicate API errors with specific status codes
    if (errorObj.status === 400) {
      return NextResponse.json(
        {
          error: 'Bad request',
          message: errorObj.message || 'Invalid request parameters',
          details: errorObj.detail || errorObj.error,
        },
        { status: 400 }
      )
    }

    if (errorObj.status === 401) {
      return NextResponse.json(
        {
          error: 'Invalid API token',
          message: 'Please check your REPLICATE_API_KEY configuration',
        },
        { status: 401 }
      )
    }

    if (errorObj.status === 402) {
      return NextResponse.json(
        {
          error: 'Payment required',
          message: 'Your Replicate account needs to be topped up with credits',
        },
        { status: 402 }
      )
    }

    if (errorObj.status === 429) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
        },
        { status: 429 }
      )
    }

    // Handle other errors
    let errorMessage = 'Failed to generate image'
    let statusCode = 500

    if (errorObj.message?.includes('timeout')) {
      errorMessage =
        'Request timeout - image generation is taking longer than expected'
      statusCode = 408
    } else if (errorObj.message?.includes('network')) {
      errorMessage = 'Network error - please check your internet connection'
      statusCode = 503
    } else if (errorObj.message?.includes('insufficient')) {
      errorMessage = 'Insufficient credits in your Replicate account'
      statusCode = 402
    }

    const errorDetails =
      error instanceof Error ? error.message : 'Unknown error occurred'

    return NextResponse.json(
      {
        error: errorMessage,
        details:
          process.env.NODE_ENV === 'development' ? errorDetails : undefined,
      },
      { status: statusCode }
    )
  }
}
