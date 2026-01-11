import { getServerSupabaseClient } from './supabase'
import type { PropCategory } from '@/types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const PROPS_BUCKET = 'hero_props'

// Category mapping based on folder names
const categoryConfig: Record<
  string,
  {
    name: string
    iconName: string
    positions: Array<
      'head' | 'leftHand' | 'rightHand' | 'body' | 'leftLeg' | 'rightLeg'
    >
  }
> = {
  hands: {
    name: 'Hands',
    iconName: 'hands',
    positions: ['leftHand', 'rightHand'],
  },
  head: {
    name: 'Head',
    iconName: 'head',
    positions: ['head'],
  },
  body: {
    name: 'Body',
    iconName: 'body',
    positions: ['body'],
  },
  legs: {
    name: 'Legs',
    iconName: 'legs',
    positions: ['leftLeg', 'rightLeg'],
  },
}

/**
 * Convert filename to a user-friendly name
 * Example: "beer_glass.png" -> "Beer Glass"
 */
const formatPropName = (filename: string): string => {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.(png|jpg|jpeg|webp)$/i, '')

  // Replace underscores and hyphens with spaces
  const nameWithSpaces = nameWithoutExt.replace(/[_-]/g, ' ')

  // Capitalize each word
  return nameWithSpaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Load props dynamically from Supabase Storage
 * This function fetches all files from the hero_props bucket and organizes them by category
 */
export const loadPropsFromStorage = async (): Promise<PropCategory[]> => {
  try {
    const supabase = getServerSupabaseClient()

    // List all files in the hero_props bucket
    const { data: files, error } = await supabase.storage
      .from(PROPS_BUCKET)
      .list('', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      })

    if (error) {
      console.error('Error fetching props from storage:', error)
      return []
    }

    if (!files || files.length === 0) {
      console.warn('No props found in storage')
      return []
    }

    // Get all folders (categories)
    const folders = files.filter(file => file.id === null) // Folders have null id

    // Fetch props for each category
    const categories: PropCategory[] = []

    for (const folder of folders) {
      const folderName = folder.name
      const config = categoryConfig[folderName]

      if (!config) {
        console.warn(`No configuration found for folder: ${folderName}`)
        continue
      }

      // List files in this folder
      const { data: categoryFiles, error: categoryError } =
        await supabase.storage.from(PROPS_BUCKET).list(folderName, {
          limit: 1000,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        })

      if (categoryError) {
        console.error(`Error fetching files from ${folderName}:`, categoryError)
        continue
      }

      // Filter out folders and only keep image files
      const imageFiles = categoryFiles.filter(
        file => file.id !== null && /\.(png|jpg|jpeg|webp)$/i.test(file.name)
      )

      // Create props array
      const props = imageFiles.map(file => {
        const propId = file.name
          .replace(/\.(png|jpg|jpeg|webp)$/i, '')
          .toLowerCase()
          .replace(/[_\s]/g, '-')

        return {
          id: propId,
          name: formatPropName(file.name),
          image: `${SUPABASE_URL}/storage/v1/object/public/${PROPS_BUCKET}/${folderName}/${file.name}`,
          positions: config.positions,
        }
      })

      if (props.length > 0) {
        categories.push({
          id: folderName,
          name: config.name,
          iconName: config.iconName,
          props: props,
        })
      }
    }

    console.log(
      `✅ Loaded ${categories.length} prop categories from Supabase Storage`
    )
    return categories
  } catch (error) {
    console.error('Failed to load props from storage:', error)
    return []
  }
}

/**
 * Get props with caching (optional - can be used with Next.js cache)
 */
export const getProps = async (): Promise<PropCategory[]> => {
  return await loadPropsFromStorage()
}
