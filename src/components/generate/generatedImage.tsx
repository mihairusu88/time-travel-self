'use client'

import { toast } from 'sonner'
import ImageFallback from '@/components/ui/image-fallback'
import { Button } from '@/components/ui/button'

interface GeneratedImageProps {
  imageUrl: string
}

export const GeneratedImage = ({ imageUrl }: GeneratedImageProps) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hero-image-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Download Started!', {
        description: 'Your hero image is being downloaded',
        duration: 3000,
      })
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Download Failed', {
        description: 'Failed to download image. Please try again.',
        duration: 4000,
      })
    }
  }

  return (
    <div className="mb-12 w-full">
      <div className="relative aspect-video w-full mx-auto rounded-xl overflow-hidden shadow-2xl border border-primary/30 mb-8">
        <div className="w-full h-full bg-card flex items-center justify-center relative">
          <ImageFallback
            src={imageUrl}
            alt="Generated hero image"
            className="w-full h-full object-contain"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
        </div>
        <Button
          onClick={handleDownload}
          className="absolute top-4 right-4 flex items-center justify-center rounded-lg bg-primary px-6 py-4 text-lg font-bold text-white transition-all duration-300 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Download
        </Button>
      </div>
    </div>
  )
}
