import { getServerSupabaseClient } from './supabase'
import type { Template, TemplateCategory } from '@/types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const TEMPLATES_BUCKET = 'hero_templates'

// Category configuration based on folder names
const categoryConfig: Record<
  string,
  {
    name: string
  }
> = {
  playful: {
    name: 'Playful & Emotional',
  },
  retro: {
    name: 'Retro & Nostalgic',
  },
  action: {
    name: 'Action & Adventure',
  },
  cinematic: {
    name: 'Cinematic & Stylized',
  },
  avengers: {
    name: 'Avengers',
  },
}

/**
 * Convert filename to a user-friendly name
 * Example: "birthday-hero.png" -> "Birthday Hero"
 */
const formatTemplateName = (filename: string): string => {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.(png|jpg|jpeg|webp)$/i, '')

  // Replace hyphens and underscores with spaces
  const nameWithSpaces = nameWithoutExt.replace(/[-_]/g, ' ')

  // Capitalize each word
  return nameWithSpaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Generate template ID from filename
 * Example: "birthday-hero.png" -> "birthday-hero"
 */
const generateTemplateId = (filename: string): string => {
  return filename
    .replace(/\.(png|jpg|jpeg|webp)$/i, '')
    .toLowerCase()
    .replace(/[_\s]/g, '-')
}

/**
 * Load templates dynamically from Supabase Storage
 * This function fetches all files from the hero_templates bucket and organizes them by category
 */
export const loadTemplatesFromStorage = async (): Promise<
  TemplateCategory[]
> => {
  try {
    const supabase = getServerSupabaseClient()

    // List all files in the hero_templates bucket
    const { data: files, error } = await supabase.storage
      .from(TEMPLATES_BUCKET)
      .list('', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      })

    if (error) {
      console.error('Error fetching templates from storage:', error)
      return []
    }

    if (!files || files.length === 0) {
      console.warn('No templates found in storage')
      return []
    }

    // Get all folders (categories)
    const folders = files.filter(file => file.id === null) // Folders have null id

    // Fetch templates for each category
    const categories: TemplateCategory[] = []

    for (const folder of folders) {
      const folderName = folder.name
      const config = categoryConfig[folderName]

      if (!config) {
        console.warn(`No configuration found for folder: ${folderName}`)
        continue
      }

      // List files in this folder
      const { data: categoryFiles, error: categoryError } =
        await supabase.storage.from(TEMPLATES_BUCKET).list(folderName, {
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

      // Create templates array
      const templates: Template[] = imageFiles.map(file => {
        return {
          id: generateTemplateId(file.name),
          name: formatTemplateName(file.name),
          image: `${SUPABASE_URL}/storage/v1/object/public/${TEMPLATES_BUCKET}/${folderName}/${file.name}`,
        }
      })

      if (templates.length > 0) {
        categories.push({
          id: folderName,
          name: config.name,
          templates: templates,
        })
      }
    }

    console.log(
      `✅ Loaded ${categories.length} template categories from Supabase Storage`
    )
    return categories
  } catch (error) {
    console.error('Failed to load templates from storage:', error)
    return []
  }
}

/**
 * Get templates with caching (optional - can be used with Next.js cache)
 */
export const getTemplates = async (): Promise<TemplateCategory[]> => {
  return await loadTemplatesFromStorage()
}
