'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import {
  Lock,
  Check,
  HandFist,
  Shirt,
  HatGlasses,
  Footprints,
  Settings,
  Sparkles,
  LayoutGrid,
  Shuffle,
  Zap,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PROMPT_TEMPLATES, GENERATE_PROMPTS } from '@/constants/generatePrompts'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import ImageFallback from '@/components/ui/image-fallback'
import {
  IMAGE_SIZES,
  ASPECT_RATIOS,
  DIMENSION_CONSTRAINTS,
  type ImageSize,
  type AspectRatio,
} from '@/constants/imageSettings'
import type { Prop, SelectedProp, PropCategory } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Collapsible } from '@/components/ui/collapsible'
import { CollapsibleContent } from '@/components/ui/collapsible'
import { useSidebar } from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface PropsSidebarProps {
  propCategories: PropCategory[]
  selectedProps: SelectedProp[]
  uploadedImage: string
  selectedTemplate: string
  onPropSelect: (
    prop: Prop,
    position:
      | 'head'
      | 'leftHand'
      | 'rightHand'
      | 'body'
      | 'leftLeg'
      | 'rightLeg'
  ) => void
  onDragStart: (e: React.DragEvent, prop: Prop) => void
  onShuffle: () => void
  onGenerate: (options: GenerationOptions) => void
  expandedPosition?: string
  shouldOpenSidebar?: boolean
  onExpandedPositionChange?: (position: string) => void
  onShouldOpenSidebarChange?: (should: boolean) => void
}

export interface GenerationOptions {
  size: ImageSize
  aspectRatio: AspectRatio
  width: number
  height: number
  prompt?: string
}

// Position display names
const positionNames: Record<string, string> = {
  head: 'Head',
  leftHand: 'Left Hand',
  rightHand: 'Right Hand',
  body: 'Body',
  leftLeg: 'Left Leg',
  rightLeg: 'Right Leg',
}

// Aspect ratio icon components
const AspectRatioIcon = ({ type }: { type: string }) => {
  const icons = {
    square: (
      <svg
        className="w-8 h-8"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <rect x="6" y="6" width="12" height="12" strokeWidth="2" rx="1" />
      </svg>
    ),
    landscape: (
      <svg
        className="w-8 h-8"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <rect x="4" y="7" width="16" height="10" strokeWidth="2" rx="1" />
      </svg>
    ),
    portrait: (
      <svg
        className="w-8 h-8"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <rect x="7" y="4" width="10" height="16" strokeWidth="2" rx="1" />
      </svg>
    ),
    wide: (
      <svg
        className="w-8 h-8"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <rect x="2" y="8" width="20" height="8" strokeWidth="2" rx="1" />
      </svg>
    ),
    vertical: (
      <svg
        className="w-8 h-8"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <rect x="8" y="2" width="8" height="20" strokeWidth="2" rx="1" />
      </svg>
    ),
  }
  return icons[type as keyof typeof icons] || icons.square
}

export const PropsSidebar = ({
  propCategories,
  selectedProps,
  uploadedImage,
  selectedTemplate,
  onPropSelect,
  onDragStart,
  onShuffle,
  onGenerate,
  expandedPosition: externalExpandedPosition,
  shouldOpenSidebar: externalShouldOpenSidebar,
  onExpandedPositionChange,
  onShouldOpenSidebarChange,
}: PropsSidebarProps) => {
  const { user } = useAuth()
  const { subscription } = useSubscription()
  const router = useRouter()
  const [internalExpandedPosition, setInternalExpandedPosition] =
    React.useState<string>('leftHand')
  const { open, setOpen, isMobile } = useSidebar()

  // Use external expanded position if provided, otherwise use internal
  const expandedPosition = externalExpandedPosition ?? internalExpandedPosition

  // Advanced options state
  const [expandedAdvanced, setExpandedAdvanced] = useState<boolean>(false)
  const [size, setSize] = useState<ImageSize>('1K')
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('4:3')
  const [width, setWidth] = useState<number>(2048)
  const [height, setHeight] = useState<number>(2048)

  // Prompt state
  const [prompt, setPrompt] = useState<string>('')
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [promptError, setPromptError] = useState<string>('')

  const userPlan = subscription?.plan || 'free'

  // Plan-based restrictions
  const canModifySize = userPlan === 'pro' || userPlan === 'premium'
  const canModifyAspectRatio = userPlan === 'pro' || userPlan === 'premium'
  const canUse4K = userPlan === 'premium'
  const canUseCustomSize = userPlan === 'premium'
  const canModifyDimensions = userPlan === 'premium' && size === 'custom'

  // Get all unique positions from all categories
  const allPositions = Array.from(
    new Set(
      propCategories.flatMap(cat => cat.props.flatMap(prop => prop.positions))
    )
  ) as Array<
    'head' | 'leftHand' | 'rightHand' | 'body' | 'leftLeg' | 'rightLeg'
  >

  // Check if a prop is selected for a specific position
  const isPropSelectedForPosition = (propId: string, position: string) => {
    return selectedProps.some(
      sp => sp.id === propId && sp.position === position
    )
  }

  // Get props available for a specific position
  const getPropsForPosition = (position: string) => {
    return propCategories.flatMap(cat =>
      cat.props.filter(prop => prop.positions.includes(position))
    )
  }

  const handlePositionClick = (position: string) => {
    const newPosition = expandedPosition === position ? '' : position
    if (onExpandedPositionChange) {
      onExpandedPositionChange(newPosition)
    } else {
      setInternalExpandedPosition(newPosition)
    }
    setExpandedAdvanced(false)
    if (!open) {
      setOpen(true)
    }
  }

  const handleAdvancedClick = () => {
    setExpandedAdvanced(!expandedAdvanced)
    if (onExpandedPositionChange) {
      onExpandedPositionChange('')
    } else {
      setInternalExpandedPosition('')
    }
    if (!open) {
      setOpen(true)
    }
  }

  const handleSizeChange = (value: ImageSize) => {
    // Check if trying to use 4K without premium
    if (value === '4K' && !canUse4K) {
      toast.error('Premium Feature', {
        description: 'Upgrade to Premium to use 4K quality',
        duration: 3000,
      })
      return
    }

    // Check if trying to use custom size without premium
    if (value === 'custom' && !canUseCustomSize) {
      toast.error('Premium Feature', {
        description: 'Upgrade to Premium to use custom dimensions',
        duration: 3000,
      })
      return
    }

    if (!canModifySize) {
      toast.error('Upgrade Required', {
        description: 'Upgrade to Pro or Premium to change image size',
        duration: 3000,
      })
      return
    }

    setSize(value)

    // Update dimensions based on size (only for preset sizes)
    if (value !== 'custom') {
      const dimensions = { '1K': 1024, '2K': 2048, '4K': 4096 }
      setWidth(dimensions[value] || 2048)
      setHeight(dimensions[value] || 2048)
    }
    // For custom, keep current width/height values
  }

  const handleAspectRatioChange = (value: AspectRatio) => {
    if (!canModifyAspectRatio) {
      toast.error('Upgrade Required', {
        description: 'Upgrade to Pro or Premium to change aspect ratio',
        duration: 3000,
      })
      return
    }
    setAspectRatio(value)
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = PROMPT_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setPrompt(template.prompt)
      setTemplateModalOpen(false)
      setPromptError('')
    }
  }

  const handleSurpriseMe = () => {
    // Check if user is authenticated
    if (!user) {
      toast.error('Authentication Required', {
        description: 'Please log in to generate images',
        duration: 4000,
      })
      router.push('/login')
      return
    }

    // Check if template is selected
    if (!selectedTemplate) {
      toast.error('Template Required', {
        description: 'Please select a template before generating',
        duration: 4000,
      })
      return
    }

    // Check if image is uploaded
    if (!uploadedImage) {
      toast.error('Image Required', {
        description: 'Please upload an image before generating',
        duration: 4000,
      })
      return
    }

    // Check if props are selected
    if (selectedProps.length === 0) {
      toast.error('Props Required', {
        description: 'Please select at least one prop before generating',
        duration: 4000,
      })
      return
    }

    // Use the default prompt for Surprise Me
    const surprisePrompt = GENERATE_PROMPTS.default

    // All validations passed, proceed with generation using default prompt
    onGenerate({
      size,
      aspectRatio,
      width,
      height,
      prompt: surprisePrompt,
    })
  }

  const handleGenerateClick = () => {
    // Check if user is authenticated
    if (!user) {
      toast.error('Authentication Required', {
        description: 'Please log in to generate images',
        duration: 4000,
      })
      router.push('/login')
      return
    }

    // Check if template is selected
    if (!selectedTemplate) {
      toast.error('Template Required', {
        description: 'Please select a template before generating',
        duration: 4000,
      })
      return
    }

    // Check if image is uploaded
    if (!uploadedImage) {
      toast.error('Image Required', {
        description: 'Please upload an image before generating',
        duration: 4000,
      })
      return
    }

    // Validate prompt
    if (!prompt || prompt.trim().length < 10) {
      setPromptError('Prompt must be at least 10 characters')
      toast.error('Prompt Required', {
        description: 'Please enter a prompt or select a template',
        duration: 4000,
      })
      return
    }

    if (prompt.length > 5000) {
      setPromptError('Prompt must not exceed 5000 characters')
      toast.error('Prompt Too Long', {
        description: 'Please shorten your prompt',
        duration: 4000,
      })
      return
    }

    setPromptError('')

    // All validations passed, proceed with generation
    onGenerate({
      size,
      aspectRatio,
      width,
      height,
      prompt,
    })
  }

  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = 'auto'
    } else {
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isMobile])

  useEffect(() => {
    console.log('🔍 Selected props:', selectedProps)
  }, [selectedProps])

  // Handle external trigger to open sidebar and expand position
  useEffect(() => {
    if (externalShouldOpenSidebar && externalExpandedPosition) {
      // Open the sidebar
      setOpen(true)
      // Close advanced settings
      setExpandedAdvanced(false)
      // Reset the flag
      if (onShouldOpenSidebarChange) {
        onShouldOpenSidebarChange(false)
      }
    }
  }, [
    externalShouldOpenSidebar,
    externalExpandedPosition,
    setOpen,
    onShouldOpenSidebarChange,
  ])

  return (
    <Sidebar className="pt-[80px] max-h-[calc(100vh-85px)]" collapsible="icon">
      <SidebarContent>
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup className="pb-0">
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {allPositions.map(position => (
                    <div key={position} className="space-y-2">
                      <SidebarMenuItem>
                        <Tooltip disableHoverableContent={true}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`w-full flex justify-start items-center gap-2 px-3 py-2 bg-sidebar-accent dark:bg-sidebar-accent/50 ${
                                expandedPosition === position
                                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold hover:bg-sidebar-accent'
                                  : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                              }`}
                              onClick={() => handlePositionClick(position)}
                            >
                              {positionNames[position] === 'Left Hand' && (
                                <HandFist className="w-4 h-4" />
                              )}
                              {positionNames[position] === 'Right Hand' && (
                                <HandFist className="w-4 h-4" />
                              )}
                              {positionNames[position] === 'Body' && (
                                <Shirt className="w-4 h-4" />
                              )}
                              {positionNames[position] === 'Head' && (
                                <HatGlasses className="w-4 h-4" />
                              )}
                              {positionNames[position] === 'Left Leg' && (
                                <Footprints className="w-4 h-4" />
                              )}
                              {positionNames[position] === 'Right Leg' && (
                                <Footprints className="w-4 h-4" />
                              )}
                              <span className="text-sm group-data-[collapsible=icon]:hidden">
                                {positionNames[position]}
                              </span>
                            </Button>
                          </TooltipTrigger>
                          {!open && (
                            <TooltipContent hideWhenDetached>
                              <p>{positionNames[position]}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </SidebarMenuItem>

                      {expandedPosition === position && open && (
                        <div className="mt-2 grid grid-cols-4 gap-2 max-h-[225px] md:max-h-[175px] overflow-y-auto group-data-[collapsible=icon]:grid-cols-1">
                          {getPropsForPosition(position).map(prop => {
                            const isSelected = isPropSelectedForPosition(
                              prop.id,
                              position
                            )

                            return (
                              <div
                                key={`${prop.id}-${position}`}
                                className={`group relative cursor-pointer overflow-hidden rounded-lg transition-all duration-200 border-2 ${
                                  isSelected
                                    ? 'border-sidebar-primary shadow-md'
                                    : 'border-sidebar-border hover:border-sidebar-primary/50'
                                }`}
                                draggable
                                onDragStart={e => onDragStart(e, prop)}
                                onClick={() => onPropSelect(prop, position)}
                              >
                                <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-sidebar-accent p-1">
                                  <ImageFallback
                                    src={prop.image}
                                    alt={prop.name}
                                    className="w-full h-full object-contain rounded-md"
                                    fill
                                    sizes="80px"
                                    placeholder={
                                      <div className="flex items-center justify-center h-full bg-sidebar-accent rounded-md">
                                        <svg
                                          className="w-6 h-6 text-sidebar-foreground/50"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1}
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                          />
                                        </svg>
                                      </div>
                                    }
                                  />
                                </div>
                                {isSelected && (
                                  <div className="absolute top-1 right-1 bg-sidebar-primary rounded-full p-1">
                                    <svg
                                      className="w-3 h-3 text-sidebar-primary-foreground"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
        <Collapsible defaultOpen className="group/collapsible mt-auto">
          <SidebarGroup className="py-0">
            <CollapsibleContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Tooltip disableHoverableContent={true}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`w-full flex justify-start items-center gap-2 px-3 py-2 bg-sidebar-accent dark:bg-sidebar-accent/50 ${
                          expandedAdvanced
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold hover:bg-sidebar-accent'
                            : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`}
                        onClick={() => handleAdvancedClick()}
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm group-data-[collapsible=icon]:hidden">
                          Advanced Settings
                        </span>
                      </Button>
                    </TooltipTrigger>
                    {!open && (
                      <TooltipContent hideWhenDetached>
                        <p>Advanced Settings</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </SidebarMenuItem>
                {expandedAdvanced && open && (
                  <div className="space-y-4 mt-2">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-sidebar-foreground/70 flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                        Image Size
                        {!canModifySize && <Lock className="w-3 h-3" />}
                      </label>
                      <div className="grid grid-cols-2 gap-2 group-data-[collapsible=icon]:grid-cols-1">
                        {IMAGE_SIZES.map(sizeOption => {
                          const isSelected = size === sizeOption.value
                          const isCustomOption = sizeOption.value === 'custom'
                          const is4KOption = sizeOption.value === '4K'

                          // Determine if this specific option is disabled
                          let isDisabled = false
                          if (isCustomOption) {
                            isDisabled = !canUseCustomSize
                          } else if (is4KOption) {
                            isDisabled = !canUse4K
                          } else {
                            isDisabled = !canModifySize
                          }

                          return (
                            <button
                              key={sizeOption.value}
                              onClick={() => handleSizeChange(sizeOption.value)}
                              disabled={isDisabled}
                              className={`
                    relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                    ${
                      isSelected && !isDisabled
                        ? 'border-sidebar-primary bg-sidebar-primary/10'
                        : 'border-sidebar-border hover:border-sidebar-primary/50'
                    }
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                            >
                              {isSelected && !isDisabled && (
                                <div className="absolute top-1 right-1">
                                  <Check className="w-4 h-4 text-sidebar-primary" />
                                </div>
                              )}
                              {isDisabled && (
                                <div className="absolute top-1 right-1">
                                  <Lock className="w-3 h-3 text-sidebar-foreground/50" />
                                </div>
                              )}
                              <span className="text-sm font-semibold text-sidebar-foreground group-data-[collapsible=icon]:text-xs">
                                {sizeOption.label}
                              </span>
                              {!isCustomOption && (
                                <span className="text-xs text-sidebar-foreground/70 mt-0.5 group-data-[collapsible=icon]:hidden">
                                  {sizeOption.dimensions}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                      {!canModifySize && (
                        <p className="text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
                          Upgrade to Pro to unlock 1K & 2K
                        </p>
                      )}
                      {canModifySize && userPlan === 'pro' && (
                        <p className="text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
                          Upgrade to Premium for 4K & custom dimensions
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-sidebar-foreground/70 flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                        Aspect Ratio
                        {!canModifyAspectRatio && <Lock className="w-3 h-3" />}
                      </label>
                      <div className="grid grid-cols-3 gap-2 group-data-[collapsible=icon]:grid-cols-1">
                        {ASPECT_RATIOS.map(ratioOption => {
                          const isSelected = aspectRatio === ratioOption.value
                          const isDisabled = !canModifyAspectRatio

                          return (
                            <button
                              key={ratioOption.value}
                              onClick={() =>
                                handleAspectRatioChange(ratioOption.value)
                              }
                              disabled={isDisabled}
                              className={`
                                relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                                ${
                                  isSelected && !isDisabled
                                    ? 'border-sidebar-primary bg-sidebar-primary/10'
                                    : 'border-sidebar-border hover:border-sidebar-primary/50'
                                }
                                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                              `}
                            >
                              {isSelected && !isDisabled && (
                                <div className="absolute top-1 right-1">
                                  <Check className="w-4 h-4 text-sidebar-primary" />
                                </div>
                              )}
                              {isDisabled && (
                                <div className="absolute top-1 right-1">
                                  <Lock className="w-3 h-3 text-sidebar-foreground/50" />
                                </div>
                              )}
                              <div className="text-sidebar-foreground mb-1 group-data-[collapsible=icon]:hidden">
                                <AspectRatioIcon type={ratioOption.icon} />
                              </div>
                              <span className="text-xs font-semibold text-sidebar-foreground">
                                {ratioOption.label}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      {!canModifyAspectRatio && (
                        <p className="text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
                          Upgrade to Pro to unlock
                        </p>
                      )}
                    </div>

                    {size === 'custom' && (
                      <>
                        <div className="space-y-2 group-data-[collapsible=icon]:hidden">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-sidebar-foreground/70 flex items-center gap-2">
                              Width
                              {!canModifyDimensions && (
                                <Lock className="w-3 h-3" />
                              )}
                            </label>
                            <span className="text-xs font-mono text-sidebar-foreground/60">
                              {width}px
                            </span>
                          </div>
                          <Slider
                            value={[width]}
                            onValueChange={values =>
                              canModifyDimensions && setWidth(values[0])
                            }
                            min={DIMENSION_CONSTRAINTS.min}
                            max={DIMENSION_CONSTRAINTS.max}
                            step={DIMENSION_CONSTRAINTS.step}
                            disabled={!canModifyDimensions}
                            className={
                              !canModifyDimensions
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }
                          />
                          <p className="text-xs text-sidebar-foreground/60">
                            Custom width (1024-4096px)
                          </p>
                        </div>

                        <div className="space-y-2 group-data-[collapsible=icon]:hidden">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-sidebar-foreground/70 flex items-center gap-2">
                              Height
                              {!canModifyDimensions && (
                                <Lock className="w-3 h-3" />
                              )}
                            </label>
                            <span className="text-xs font-mono text-sidebar-foreground/60">
                              {height}px
                            </span>
                          </div>
                          <Slider
                            value={[height]}
                            onValueChange={values =>
                              canModifyDimensions && setHeight(values[0])
                            }
                            min={DIMENSION_CONSTRAINTS.min}
                            max={DIMENSION_CONSTRAINTS.max}
                            step={DIMENSION_CONSTRAINTS.step}
                            disabled={!canModifyDimensions}
                            className={
                              !canModifyDimensions
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }
                          />
                          <p className="text-xs text-sidebar-foreground/60">
                            Custom height (1024-4096px)
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </SidebarMenu>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      {/* Fixed buttons at bottom */}
      <SidebarFooter>
        <SidebarMenu>
          {/* Shuffle Button */}
          <SidebarMenuItem
            className={`flex items-center justify-between gap-1 ${open ? 'flex-row' : 'flex-col'}`}
          >
            <Button
              className="flex flex-grow"
              onClick={onShuffle}
              variant="outline"
              size="sm"
            >
              <Shuffle className="w-4 h-4 group-data-[collapsible=icon]:mx-auto" />
              <span className="group-data-[collapsible=icon]:hidden">
                Shuffle
              </span>
            </Button>
            <Button
              className={`flex ${open ? 'w-1/2' : 'w-full'}`}
              onClick={() => setTemplateModalOpen(true)}
              variant="outline"
              size="sm"
            >
              <LayoutGrid className="w-4 h-4 group-data-[collapsible=icon]:mx-auto" />
              <span className="group-data-[collapsible=icon]:hidden">
                Prompt Template
              </span>
            </Button>
          </SidebarMenuItem>

          {/* Prompt Textarea */}
          <SidebarMenuItem>
            <div className="space-y-1 group-data-[collapsible=icon]:hidden">
              <label className="text-xs font-medium text-sidebar-foreground/70">
                Prompt
              </label>
              <Textarea
                value={prompt}
                onChange={e => {
                  setPrompt(e.target.value)
                  setPromptError('')
                }}
                placeholder="Describe what you want to change in the image..."
                className="min-h-[100px] resize-none bg-sidebar-accent dark:bg-sidebar-accent/50 border-sidebar-border text-sm"
              />
              {promptError && (
                <p className="text-xs text-red-500 dark:text-red-400">
                  {promptError}
                </p>
              )}
              <p className="text-xs text-sidebar-foreground/60">
                {prompt.length}/5000 characters
              </p>
            </div>
          </SidebarMenuItem>

          {/* Surprise Me and Generate buttons on same line */}
          <SidebarMenuItem>
            <div className="flex gap-1 w-full group-data-[collapsible=icon]:flex-col">
              <Button onClick={handleSurpriseMe} className="flex-1 text-white">
                <Sparkles className="w-4 h-4 group-data-[collapsible=icon]:mx-auto" />
                <span className="group-data-[collapsible=icon]:hidden ml-2">
                  Surprise Me
                </span>
              </Button>
              <Button
                onClick={handleGenerateClick}
                className="flex-1 text-white"
              >
                <Zap className="w-4 h-4 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:mr-0" />
                <span className="group-data-[collapsible=icon]:hidden ml-2">
                  Generate
                </span>
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Template Selection Modal */}
      <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
        <DialogContent className="max-w-[90%] sm:max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-primary">
              Prompt Template Library
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto max-h-[70vh] p-4">
            {PROMPT_TEMPLATES.map(template => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className="flex flex-col items-center justify-center p-6 rounded-xl bg-card border-2 border-gray-200 dark:border-gray-700 hover:border-primary transition-all hover:shadow-lg group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {template.emoji}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-center">
                  {template.name}
                </h3>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Sidebar>
  )
}
