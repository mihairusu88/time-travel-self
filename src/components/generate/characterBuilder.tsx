'use client'

import { Button } from '@/components/ui/button'
import { TemplatesSection } from './templatesSection'
import { PropSlot } from './propSlot'
import { Upload } from 'lucide-react'
import Image from 'next/image'
import type { SelectedProp, TemplateCategory } from '@/types'
import { useDropzone } from 'react-dropzone'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { UPLOAD_SETTINGS } from '@/constants/uploadSettings'

interface CharacterBuilderProps {
  templateCategories: TemplateCategory[]
  showTemplates: boolean
  selectedTemplate: string
  selectedProps: SelectedProp[]
  uploadedImage: string
  fileInputRef: React.RefObject<HTMLInputElement | null>
  imageFileTypes: string
  onTemplateToggle: () => void
  onTemplateSelect: (templateId: string) => void
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onImageClick: () => void
  onDrop: (e: React.DragEvent, position: string) => void
  onDragOver: (e: React.DragEvent) => void
  onRemoveProp: (position: string) => void
  onSelectProp: (position: string) => void
}

export const CharacterBuilder = ({
  templateCategories,
  showTemplates,
  selectedTemplate,
  selectedProps,
  uploadedImage,
  fileInputRef,
  imageFileTypes,
  onTemplateToggle,
  onTemplateSelect,
  onImageUpload,
  onImageClick,
  onDrop,
  onDragOver,
  onRemoveProp,
  onSelectProp,
}: CharacterBuilderProps) => {
  // React Dropzone configuration
  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          // Create a synthetic event to match the existing handler signature
          const syntheticEvent = {
            target: {
              files: [file],
            },
          } as unknown as React.ChangeEvent<HTMLInputElement>
          onImageUpload(syntheticEvent)
        }
        reader.readAsDataURL(file)
      }
    },
    [onImageUpload]
  )

  const onDropRejected = useCallback(
    (fileRejections: any[]) => {
      fileRejections.forEach(rejection => {
        const { file, errors } = rejection
        errors.forEach((error: any) => {
          let errorMessage = 'File upload failed'
          let errorDescription = ''

          if (error.code === 'file-too-large') {
            errorMessage = 'File Too Large'
            errorDescription = `${file.name} exceeds the ${UPLOAD_SETTINGS.maxSize / 1024 / 1024}MB size limit`
          } else if (error.code === 'file-invalid-type') {
            errorMessage = 'Invalid File Type'
            errorDescription = `${file.name} is not a supported format. Please use ${imageFileTypes}`
          } else {
            errorDescription = error.message
          }

          toast.error(errorMessage, {
            description: errorDescription,
            duration: 4000,
          })
        })
      })
    },
    [imageFileTypes]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDropAccepted,
      onDropRejected,
      accept: {
        [UPLOAD_SETTINGS.validTypes[0]]: ['.jpg', '.jpeg'],
        [UPLOAD_SETTINGS.validTypes[2]]: ['.png'],
      },
      maxSize: UPLOAD_SETTINGS.maxSize,
      multiple: false,
      noClick: false,
      noKeyboard: false,
    })

  return (
    <div className="flex-grow p-6 md:p-8 flex items-center justify-center bg-gray-100 dark:bg-background relative">
      {/* Select Template Button */}
      <div className="absolute -top-10 left-12 z-20">
        <Button onClick={onTemplateToggle} variant="outline" size="sm">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
          Hero Template
        </Button>
      </div>

      {/* Templates Section */}
      <TemplatesSection
        templateCategories={templateCategories}
        isVisible={showTemplates}
        selectedTemplate={selectedTemplate}
        onTemplateSelect={onTemplateSelect}
      />

      <div className="w-full max-w-3xl mx-auto">
        <div className="grid max-h-full grid-cols-3 grid-rows-3 gap-y-2 gap-x-2 items-center justify-items-center relative">
          {/* Head */}
          <div className="col-start-2 row-start-1 flex justify-center w-full">
            <PropSlot
              position="head"
              label="Head"
              size="full"
              shape="rounded"
              selectedProp={selectedProps.find(p => p.position === 'head')}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onRemove={onRemoveProp}
              onSelectProp={onSelectProp}
            />
          </div>

          {/* Left Hand */}
          <div className="col-start-1 row-start-2 flex justify-start w-full">
            <PropSlot
              position="leftHand"
              label="Left Hand"
              size="full"
              shape="rounded"
              selectedProp={selectedProps.find(p => p.position === 'leftHand')}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onRemove={onRemoveProp}
              onSelectProp={onSelectProp}
            />
          </div>

          {/* Character Center - Upload Area with React Dropzone */}
          <div className="col-start-2 row-start-2 flex justify-center items-center w-full">
            {uploadedImage ? (
              <div
                className="relative w-full h-48 rounded-2xl overflow-hidden cursor-pointer border-4 border-primary shadow-lg transition-transform hover:scale-105"
                onClick={onImageClick}
              >
                <Image
                  src={uploadedImage}
                  alt="Uploaded character"
                  className="object-contain"
                  fill
                  sizes="128px"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`w-full h-48 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                  isDragActive && !isDragReject
                    ? 'border-primary bg-primary/10 dark:bg-primary/20 scale-105'
                    : isDragReject
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-700 bg-gray-300 dark:bg-gray-900 hover:border-primary dark:hover:border-primary hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <input {...getInputProps()} />
                {isDragReject ? (
                  <>
                    <Upload className="w-8 h-8 text-red-600 dark:text-red-400" />
                    <span className="text-sm text-red-600 dark:text-red-400 font-medium text-center px-2">
                      Invalid file format or size format
                    </span>
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium text-center px-2">
                      Only {imageFileTypes} files up to{' '}
                      {UPLOAD_SETTINGS.maxSize / 1024 / 1024}MB
                    </span>
                  </>
                ) : isDragActive ? (
                  <>
                    <Upload className="w-8 h-8 text-primary" />
                    <span className="text-sm text-primary font-medium text-center px-2">
                      Drop your image here
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-card-foreground" />
                    <span className="text-sm text-card-foreground font-medium text-center px-2">
                      Click or drag to upload photo
                    </span>
                    <span className="text-xs text-card-foreground font-medium text-center px-2">
                      Supports {imageFileTypes}
                    </span>
                    <span className="text-xs text-card-foreground font-medium text-center px-2">
                      Max size: {UPLOAD_SETTINGS.maxSize / 1024 / 1024}MB
                    </span>
                  </>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={UPLOAD_SETTINGS.validTypes.join(',')}
              onChange={onImageUpload}
              className="hidden"
            />
          </div>

          {/* Right Hand */}
          <div className="col-start-3 row-start-2 flex justify-end w-full">
            <PropSlot
              position="rightHand"
              label="Right Hand"
              size="full"
              shape="rounded"
              selectedProp={selectedProps.find(p => p.position === 'rightHand')}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onRemove={onRemoveProp}
              onSelectProp={onSelectProp}
            />
          </div>

          {/* Body */}
          <div className="col-start-2 row-start-3 flex justify-center w-full">
            <PropSlot
              position="body"
              label="Body"
              size="full"
              shape="rounded"
              selectedProp={selectedProps.find(p => p.position === 'body')}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onRemove={onRemoveProp}
              onSelectProp={onSelectProp}
            />
          </div>

          {/* Left Leg */}
          <div className="col-start-1 row-start-3 flex justify-start items-end w-full">
            <PropSlot
              position="leftLeg"
              label="Left Leg"
              size="full"
              shape="rounded"
              selectedProp={selectedProps.find(p => p.position === 'leftLeg')}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onRemove={onRemoveProp}
              onSelectProp={onSelectProp}
            />
          </div>

          {/* Right Leg */}
          <div className="col-start-3 row-start-3 flex justify-end items-end w-full">
            <PropSlot
              position="rightLeg"
              label="Right Leg"
              size="full"
              shape="rounded"
              selectedProp={selectedProps.find(p => p.position === 'rightLeg')}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onRemove={onRemoveProp}
              onSelectProp={onSelectProp}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
