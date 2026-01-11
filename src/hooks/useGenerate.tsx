import { useState, useRef, useMemo } from 'react'
import { toast } from 'sonner'
import type { Prop, SelectedProp, PropCategory } from '@/types'
import { useSubscription } from './useSubscription'
import type { GenerationOptions } from '@/components/layout/propsSidebar'
import { UPLOAD_SETTINGS } from '@/constants/uploadSettings'

export const useGenerate = (propCategories: PropCategory[]) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('hands')
  const [selectedProps, setSelectedProps] = useState<SelectedProp[]>([])
  const [uploadedImage, setUploadedImage] = useState<string>('')
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCheckingLimits, setIsCheckingLimits] = useState(false)
  const [generationComplete, setGenerationComplete] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [generatedImage, setGeneratedImage] = useState<string>('')
  const [generationError, setGenerationError] = useState<string>('')
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { refetch: refetchSubscription, loading: subscriptionLoading } =
    useSubscription()
  const imageFileTypes = useMemo(() => {
    const types = []

    for (const type of UPLOAD_SETTINGS.validTypes) {
      if (type === 'image/jpeg') {
        types.push('JPEG')
      } else if (type === 'image/jpg') {
        types.push('JPG')
      } else if (type === 'image/png') {
        types.push('PNG')
      }
    }

    return types.join(', ')
  }, [UPLOAD_SETTINGS.validTypes])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = UPLOAD_SETTINGS.validTypes
      if (
        !validTypes.includes(
          file.type as (typeof UPLOAD_SETTINGS.validTypes)[number]
        )
      ) {
        toast.error('Invalid File Type', {
          description: `${file.name} is not a supported format. Please use ${imageFileTypes}`,
          duration: 4000,
        })
        // Clear the input to allow selecting a new file
        if (e.target) {
          e.target.value = ''
        }
        return
      }

      // Validate file size
      const maxSize = UPLOAD_SETTINGS.maxSize // 10MB in bytes
      if (file.size > maxSize) {
        toast.error('File Too Large', {
          description: `${file.name} exceeds the ${UPLOAD_SETTINGS.maxSize / 1024 / 1024}MB size limit`,
          duration: 4000,
        })
        // Clear the input to allow selecting a new file
        if (e.target) {
          e.target.value = ''
        }
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImage(reader.result as string)
        toast.success('Image Uploaded!', {
          description: `${file.name} has been uploaded successfully`,
          duration: 3000,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleDragStart = (e: React.DragEvent, prop: Prop) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(prop))
  }

  const handlePropSelect = (
    prop: Prop,
    position:
      | 'head'
      | 'leftHand'
      | 'rightHand'
      | 'body'
      | 'leftLeg'
      | 'rightLeg'
  ) => {
    // Check if this prop is already selected for this position
    const isAlreadySelected = selectedProps.some(
      sp => sp.id === prop.id && sp.position === position
    )

    if (isAlreadySelected) {
      // Deselect: remove the prop from this position
      setSelectedProps(prev =>
        prev.filter(p => !(p.id === prop.id && p.position === position))
      )
    } else {
      // Select: add the prop to this position (remove any existing prop in this position first)
      const newProp: SelectedProp = {
        id: prop.id,
        name: prop.name,
        image: prop.image,
        position: position,
      }

      const filteredProps = selectedProps.filter(p => p.position !== position)
      setSelectedProps([...filteredProps, newProp])
    }
  }

  const handleDrop = (e: React.DragEvent, position: string) => {
    e.preventDefault()

    const propData = JSON.parse(e.dataTransfer.getData('text/plain')) as Prop

    // Check if this prop can be placed in this position
    if (propData.positions && propData.positions.includes(position)) {
      const newProp: SelectedProp = {
        id: propData.id,
        name: propData.name,
        image: propData.image,
        position: position as SelectedProp['position'],
      }

      // Remove any existing prop in this position
      const filteredProps = selectedProps.filter(p => p.position !== position)
      setSelectedProps([...filteredProps, newProp])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const removeProp = (position: string) => {
    setSelectedProps(prev => prev.filter(p => p.position !== position))
  }

  const handleShuffle = () => {
    const newSelectedProps: SelectedProp[] = []
    const allProps: Prop[] = propCategories.flatMap(cat => cat.props)

    // Shuffle props for each position
    const positions: Array<
      'head' | 'leftHand' | 'rightHand' | 'body' | 'leftLeg' | 'rightLeg'
    > = ['head', 'leftHand', 'rightHand', 'body', 'leftLeg', 'rightLeg']

    positions.forEach(position => {
      // Filter props that can be placed in this position
      const validProps = allProps.filter(prop =>
        prop.positions.includes(position)
      )

      if (validProps.length > 0) {
        // Select a random prop
        const randomProp =
          validProps[Math.floor(Math.random() * validProps.length)]
        newSelectedProps.push({
          id: randomProp.id,
          name: randomProp.name,
          image: randomProp.image,
          position: position,
        })
      }
    })

    setSelectedProps(newSelectedProps)
  }

  const handleGenerate = async (options: GenerationOptions) => {
    setGenerationError('')

    try {
      // Stage 1: Check subscription limits
      setIsCheckingLimits(true)
      console.log('🔍 Checking subscription limits...')

      const limitCheckResponse = await refetchSubscription()
      const limitData = limitCheckResponse
      const { subscription } = limitData

      if (
        subscription &&
        subscription.generationsUsed >= subscription.generationsLimit
      ) {
        console.log('❌ Generation limit exceeded')
        setIsCheckingLimits(false)
        setShowUpgradePrompt(true)
        throw new Error(
          'You have reached your monthly generation limit. Please upgrade your plan to continue.'
        )
      }

      console.log(
        `✅ Limit check passed: ${subscription?.generationsUsed}/${subscription?.generationsLimit}`
      )

      // Small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 250))

      // Stage 2: Start generation
      setIsCheckingLimits(false)
      setIsGenerating(true)
      setUploading(true)
      console.log('📤 Uploading user image...')
      const uploadResponse = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: uploadedImage,
          folder: 'images',
        }),
      })

      const uploadData = await uploadResponse.json()

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || 'Upload failed')
      }

      if (!uploadData.url) {
        throw new Error('No URL in upload response')
      }

      console.log('✅ Image uploaded successfully:', uploadData.url)
      setUploadedImageUrl(uploadData.url)
      setUploading(false)

      console.log('🎨 Starting image generation...')
      console.log('📊 Generation options:', options)
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uploadedImage: uploadData.url,
          uploadedImagePath: uploadData.path,
          selectedProps,
          selectedTemplate,
          options, // Include generation options
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Check if it's a generation limit error
        if (response.status === 403 && data.code === 'LIMIT_EXCEEDED') {
          setShowUpgradePrompt(true)
          throw new Error(
            data.message ||
              'Generation limit exceeded. Please upgrade your plan.'
          )
        }
        throw new Error(data.error || 'Failed to generate image')
      }

      // Extract the image URL from the output
      let imageUrl = ''
      if (typeof data.output === 'string') {
        imageUrl = data.output
      } else if (Array.isArray(data.output) && data.output.length > 0) {
        imageUrl = data.output[0]
      } else if (data.output && typeof data.output === 'object') {
        imageUrl = data.output.url || data.output[0] || ''
      }

      if (!imageUrl) {
        throw new Error('No image URL in response')
      }

      setGeneratedImage(imageUrl)
      setGenerationComplete(true)
      setShowShare(true)
    } catch (error: unknown) {
      const errorObj = error as { message?: string }
      console.error('Generation error:', error)
      const errorMessage =
        errorObj.message || 'Failed to generate image. Please try again.'
      setGenerationError(errorMessage)
      toast.error('Generation Failed', {
        description: errorMessage,
        duration: 5000,
      })
    } finally {
      setIsGenerating(false)
      setIsCheckingLimits(false)
      setUploading(false)
    }
  }

  const handleCreateAnother = () => {
    setShowShare(false)
    setGenerationComplete(false)
    setSelectedProps([])
    setUploadedImage('')
    setUploadedImageUrl('')
    setSelectedTemplate('')
    setGeneratedImage('')
    setGenerationError('')
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    setShowTemplates(false)
  }

  const [expandedPosition, setExpandedPosition] = useState<string>('leftHand')
  const [shouldOpenSidebar, setShouldOpenSidebar] = useState<boolean>(false)

  const handleSelectProp = (position: string) => {
    console.log('🔍 Selecting prop for position:', position)
    setExpandedPosition(position)
    setShouldOpenSidebar(true)
  }

  return {
    // State
    selectedCategory,
    selectedProps,
    uploadedImage,
    uploadedImageUrl,
    isGenerating,
    isCheckingLimits,
    generationComplete,
    showShare,
    showTemplates,
    selectedTemplate,
    generatedImage,
    generationError,
    showUpgradePrompt,
    fileInputRef,
    uploading,
    subscriptionLoading,
    expandedPosition,
    shouldOpenSidebar,
    imageFileTypes,

    // Setters
    setSelectedCategory,
    setShowTemplates,
    setShowUpgradePrompt,
    setExpandedPosition,
    setShouldOpenSidebar,

    // Handlers
    handleImageUpload,
    handleImageClick,
    handleDragStart,
    handlePropSelect,
    handleDrop,
    handleDragOver,
    removeProp,
    handleShuffle,
    handleGenerate,
    handleCreateAnother,
    handleTemplateSelect,
    handleSelectProp,
  }
}
