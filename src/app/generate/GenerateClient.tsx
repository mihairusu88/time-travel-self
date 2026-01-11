'use client'

import { LoadingSection } from '@/components/generate/loadingSection'
import { ShareSection } from '@/components/generate/shareSection'
import { PropsSidebar } from '@/components/layout/propsSidebar'
import { CharacterBuilder } from '@/components/generate/characterBuilder'
import { UpgradePrompt } from '@/components/subscription/upgradePrompt'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { useGenerate } from '@/hooks/useGenerate'
import { useSubscription } from '@/hooks/useSubscription'
import type { PropCategory, TemplateCategory } from '@/types'

export default function GenerateClient({
  propCategories,
  templateCategories,
}: {
  propCategories: PropCategory[]
  templateCategories: TemplateCategory[]
}) {
  const { subscription } = useSubscription()

  const {
    // State
    selectedProps,
    uploadedImage,
    isGenerating,
    isCheckingLimits,
    showShare,
    showTemplates,
    selectedTemplate,
    generatedImage,
    showUpgradePrompt,
    fileInputRef,
    expandedPosition,
    shouldOpenSidebar,
    imageFileTypes,

    // Setters
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
  } = useGenerate(propCategories)

  // Show loading section for both checking limits and generating
  if (isCheckingLimits || isGenerating) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-100 dark:bg-background font-display">
        <LoadingSection
          isCheckingLimits={isCheckingLimits}
          isGenerating={isGenerating}
        />
      </div>
    )
  }

  // If showing share page, render share content
  if (showShare) {
    return (
      <ShareSection
        generatedImage={generatedImage}
        onCreateAnother={handleCreateAnother}
      />
    )
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen md:min-h-[calc(100vh-85px-80px)] w-full bg-gray-100 dark:bg-background font-display text-gray-800 dark:text-gray-200">
        {/* Sidebar */}
        <PropsSidebar
          propCategories={propCategories}
          selectedProps={selectedProps}
          uploadedImage={uploadedImage}
          selectedTemplate={selectedTemplate}
          onPropSelect={handlePropSelect}
          onDragStart={handleDragStart}
          onShuffle={handleShuffle}
          onGenerate={handleGenerate}
          expandedPosition={expandedPosition}
          shouldOpenSidebar={shouldOpenSidebar}
          onExpandedPositionChange={setExpandedPosition}
          onShouldOpenSidebarChange={setShouldOpenSidebar}
        />

        {/* Main Content */}
        <main className="flex flex-1 flex-col flex-grow">
          {/* Sidebar Trigger */}
          <div className="border-b border-gray-200 dark:border-gray-800 p-2">
            <SidebarTrigger />
          </div>

          {/* Character Builder */}
          <div className="flex flex-col flex-grow">
            <CharacterBuilder
              templateCategories={templateCategories}
              showTemplates={showTemplates}
              selectedTemplate={selectedTemplate}
              selectedProps={selectedProps}
              uploadedImage={uploadedImage}
              fileInputRef={fileInputRef}
              onTemplateToggle={() => setShowTemplates(!showTemplates)}
              onTemplateSelect={handleTemplateSelect}
              onImageUpload={handleImageUpload}
              onImageClick={handleImageClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onRemoveProp={removeProp}
              onSelectProp={handleSelectProp}
              imageFileTypes={imageFileTypes}
            />
          </div>
        </main>

        {/* Upgrade Prompt Dialog */}
        <UpgradePrompt
          open={showUpgradePrompt}
          onClose={() => setShowUpgradePrompt(false)}
          currentPlan={subscription?.plan}
        />
      </div>
    </SidebarProvider>
  )
}
