export const IMAGE_SIZES = [
  { value: '1K', label: '1K', dimensions: '1024x1024' },
  { value: '2K', label: '2K', dimensions: '2048x2048' },
  { value: '4K', label: '4K', dimensions: '4096x4096' },
  { value: 'custom', label: 'Custom', dimensions: 'custom' },
] as const

export const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1', description: 'Square', icon: 'square' },
  { value: '4:3', label: '4:3', description: 'Standard', icon: 'landscape' },
  { value: '3:4', label: '3:4', description: 'Portrait', icon: 'portrait' },
  { value: '16:9', label: '16:9', description: 'Widescreen', icon: 'wide' },
  { value: '9:16', label: '9:16', description: 'Vertical', icon: 'vertical' },
] as const

export const DIMENSION_CONSTRAINTS = {
  min: 1024,
  max: 4096,
  step: 128,
} as const

export type ImageSize = (typeof IMAGE_SIZES)[number]['value']
export type AspectRatio = (typeof ASPECT_RATIOS)[number]['value']
