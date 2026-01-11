'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ImageFallbackProps {
  src: string
  alt: string
  fallbackSrc?: string
  className?: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  placeholder?: React.ReactNode
  sizes?: string
  onError?: () => void
}

const ImageFallback: React.FC<ImageFallbackProps> = ({
  src,
  alt,
  fallbackSrc = '/placeholder-image.png',
  className,
  width,
  height,
  fill = false,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  placeholder,
  onError,
}) => {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Update imgSrc when src prop changes
  useEffect(() => {
    setImgSrc(src)
    setIsLoading(true)
    setHasError(false)
  }, [src])

  // Handle empty or invalid src (check both original src and current imgSrc)
  if (!src || src.trim() === '' || !imgSrc || imgSrc.trim() === '') {
    if (placeholder) {
      return <div className={className}>{placeholder}</div>
    }
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-200 dark:bg-gray-800',
          className
        )}
      >
        <div className="text-gray-500 dark:text-gray-400 text-center p-4">
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">Image not available</span>
        </div>
      </div>
    )
  }

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc)
      setHasError(false)
    } else {
      setHasError(true)
    }
    onError?.()
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  if (hasError && placeholder) {
    return <div className={className}>{placeholder}</div>
  }

  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-200 dark:bg-gray-800',
          className
        )}
      >
        <div className="text-gray-500 dark:text-gray-400 text-center p-4">
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">Image not available</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {isLoading && placeholder && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            className
          )}
        >
          {placeholder}
        </div>
      )}
      <Image
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        sizes={sizes}
        className={cn(
          className,
          isLoading
            ? 'opacity-0'
            : 'opacity-100 transition-opacity duration-300'
        )}
        onError={handleError}
        onLoad={handleLoad}
      />
    </>
  )
}

export default ImageFallback
