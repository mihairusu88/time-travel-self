'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import ImageFallback from '@/components/ui/image-fallback'

const heroImages = [
  {
    id: 1,
    src: '/images/hero/hero_image1.jpeg',
    alt: 'Hero 1',
  },
  {
    id: 2,
    src: '/images/hero/hero_image2.jpeg',
    alt: 'Hero 2',
  },
  {
    id: 3,
    src: '/images/hero/hero_image3.jpeg',
    alt: 'Hero 3',
  },
  {
    id: 4,
    src: '/images/hero/hero_image4.jpeg',
    alt: 'Hero 4',
  },
]

export const HeroSection = () => {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-4 md:pt-8 md:pb-20 relative overflow-hidden">
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 text-center mb-16">
        <h1 className="text-5xl font-black tracking-tight text-gray-900 dark:text-white sm:text-6xl md:text-7xl max-w-5xl">
          Become the{' '}
          <span className="text-transparent bg-clip-text bg-primary">Hero</span>{' '}
          of Your Story
        </h1>
        <p className="max-w-3xl text-lg text-gray-600 dark:text-gray-300">
          Transform your photos into epic, AI-powered images. Create
          unforgettable cinematic moments with just a few clicks.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/generate">
            <Button className="flex items-center justify-center rounded-lg bg-primary px-8 py-6 text-lg font-bold text-white shadow-lg transition-all hover:scale-105">
              Get Started
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero images grid */}
      <div className="relative z-10 grid grid-cols-2 md:flex items-center justify-center gap-6 perspective-1000">
        {heroImages.map((image, index) => (
          <div
            key={image.id}
            className={`relative w-10/12 h-fit md:w-4/12 transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
              index === 0
                ? 'rotate-[-10deg] -translate-y-8'
                : index === 1
                  ? 'rotate-[10deg] -translate-y-8 md:-translate-y-2'
                  : index === 2
                    ? 'rotate-[-4deg] -translate-y-2'
                    : 'rotate-[12deg] -translate-y-2'
            }`}
            style={{
              animation: `float ${3 + index * 0.5}s ease-in-out infinite`,
            }}
          >
            <div
              className={`aspect-square rounded-3xl overflow-hidden shadow-2xl bg-primary p-1`}
            >
              <div className="w-full h-full rounded-3xl overflow-hidden bg-white">
                <ImageFallback
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  width={224}
                  height={288}
                  sizes="224px"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
