'use client'

import ImageFallback from '@/components/ui/image-fallback'
import type { SelectedProp } from '@/types'
import { Footprints, HandFist, HatGlasses, Shirt, X } from 'lucide-react'
import { Button } from '../ui/button'

interface PropSlotProps {
  position: string
  label: string
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  shape: 'circle' | 'rounded'
  selectedProp?: SelectedProp
  onDrop: (e: React.DragEvent, position: string) => void
  onDragOver: (e: React.DragEvent) => void
  onRemove: (position: string) => void
  onSelectProp: (position: string) => void
}

const sizeClasses = {
  sm: 'w-24 h-24',
  md: 'w-28 h-28',
  lg: 'w-36 h-40',
  xl: 'w-42 h-42',
  full: 'w-full h-48',
}

const shapeClasses = {
  circle: 'rounded-full',
  rounded: 'rounded-xl',
}

export const PropSlot = ({
  position,
  label,
  size,
  shape,
  selectedProp,
  onDrop,
  onDragOver,
  onRemove,
  onSelectProp,
}: PropSlotProps) => {
  return (
    <div
      className={`${sizeClasses[size]} ${shapeClasses[shape]} border-2 border-dashed border-gray-300 dark:border-gray-600 bg-card flex items-center justify-center transition-all duration-300 hover:bg-primary/30 hover:border-primary dark:hover:border-primary cursor-pointer relative`}
      onDrop={e => onDrop(e, position)}
      onDragOver={onDragOver}
      onClick={() => onSelectProp(position)}
    >
      {selectedProp ? (
        <div
          className={`w-full h-full ${shapeClasses[shape]} overflow-hidden relative`}
        >
          <ImageFallback
            src={selectedProp.image}
            alt={`${label} prop`}
            className="w-full h-full object-contain"
            width={100}
            height={100}
            priority={true}
            sizes="(max-width: 768px) 30vw, 150px"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 rounded-full"
            onClick={() => onRemove(position)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <p
          className={`${size === 'sm' || size === 'xl' || size === 'full' ? 'text-sm' : 'text-sm'} flex flex-col items-center justify-center gap-2 text-primary font-bold ${size === 'sm' || size === 'xl' || size === 'full' ? '' : 'text-center'}`}
        >
          {position === 'head' && <HatGlasses className="w-16 h-16" />}
          {position === 'leftHand' && (
            <HandFist className="w-16 h-16 transform -scale-x-[1] -rotate-90" />
          )}
          {position === 'rightHand' && (
            <HandFist className="w-16 h-16 transform rotate-90" />
          )}
          {position === 'body' && <Shirt className="w-16 h-16" />}
          {position === 'leftLeg' && <Footprints className="w-16 h-16" />}
          {position === 'rightLeg' && <Footprints className="w-16 h-16" />}
          {label}
        </p>
      )}
    </div>
  )
}
