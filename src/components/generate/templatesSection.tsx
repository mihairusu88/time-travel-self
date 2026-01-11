'use client'

import ImageFallback from '@/components/ui/image-fallback'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { TemplateCategory } from '@/types'
import { Lock } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'
import { toast } from 'sonner'
import Link from 'next/link'

interface TemplatesSectionProps {
  templateCategories: TemplateCategory[]
  isVisible: boolean
  selectedTemplate: string
  onTemplateSelect: (templateId: string) => void
}

const FREE_TEMPLATES_LIMIT = 3

export const TemplatesSection = ({
  templateCategories,
  isVisible,
  selectedTemplate,
  onTemplateSelect,
}: TemplatesSectionProps) => {
  const { subscription } = useSubscription()
  const userPlan = subscription?.plan || 'free'
  const isFreeUser = userPlan === 'free'

  if (!isVisible) return null

  const handleTemplateClick = (templateId: string, index: number) => {
    // Check if template is locked for free users
    if (isFreeUser && index >= FREE_TEMPLATES_LIMIT) {
      toast.error('Upgrade Required', {
        description: 'Upgrade to Pro or Premium to unlock all templates',
        duration: 4000,
        action: {
          label: 'Upgrade',
          onClick: () => {
            window.location.href = '/pricing'
          },
        },
      })
      return
    }

    onTemplateSelect(templateId)
  }

  return (
    <div className="absolute inset-0 bg-gray-100 dark:bg-background backdrop-blur-sm z-10 overflow-hidden flex flex-col">
      <div className="p-6 flex-shrink-0">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-card-foreground mb-2">
            Choose a Template
          </h3>
          <p className="dark:text-gray-400 text-gray-900">
            Select a template to transform you into an epic hero image.
          </p>
        </div>

        <Tabs defaultValue={templateCategories[0].id} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-gray-200 dark:bg-gray-800/50 mb-4">
            {templateCategories.map(category => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="dark:text-gray-300 text-black whitespace-nowrap cursor-pointer"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="overflow-auto max-h-[calc(100vh-280px)] h-[calc(100vh-400px)]">
            {templateCategories.map(category => (
              <TabsContent
                key={category.id}
                value={category.id}
                className="mt-0"
              >
                {/* Upgrade prompt for free users */}
                {isFreeUser &&
                  category.templates.length > FREE_TEMPLATES_LIMIT && (
                    <div className="mb-2 p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-lg mx-4">
                      <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/20 p-2 rounded-full">
                            <Lock className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-card-foreground">
                              Unlock{' '}
                              {category.templates.length - FREE_TEMPLATES_LIMIT}{' '}
                              More Templates
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Upgrade to Pro or Premium to access all templates
                            </p>
                          </div>
                        </div>
                        <Link href="/pricing">
                          <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                            Upgrade
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-4">
                  {category.templates.map((template, index) => {
                    const isLocked = isFreeUser && index >= FREE_TEMPLATES_LIMIT
                    const isSelected = selectedTemplate === template.id

                    return (
                      <div
                        key={index + template.id}
                        className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
                          isLocked
                            ? 'cursor-not-allowed opacity-75'
                            : 'cursor-pointer'
                        } ${
                          isSelected
                            ? 'ring-2 ring-primary'
                            : !isLocked && 'hover:scale-105'
                        }`}
                        onClick={() => handleTemplateClick(template.id, index)}
                      >
                        <div className="aspect-square bg-card w-full relative overflow-hidden">
                          <ImageFallback
                            src={template.image}
                            alt={`${template.name} template`}
                            className={`w-full h-full object-contain transition-transform duration-300 ${
                              !isLocked && 'group-hover:scale-110'
                            } ${isLocked && 'blur-sm'}`}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 200px"
                          />

                          {/* Template name overlay */}
                          <div className="absolute w-full inset-0 bg-gradient-to-t dark:from-black/20 from-white/20 to-transparent flex items-end justify-center">
                            <p className="py-2 px-2 w-full bg-white/80 dark:bg-black/70 text-black dark:text-white font-bold text-sm text-center">
                              {template.name}
                            </p>
                          </div>

                          {/* Selected checkmark */}
                          {isSelected && !isLocked && (
                            <div className="absolute top-2 right-2 bg-primary rounded-full p-1.5">
                              <svg
                                className="w-4 h-4 text-white"
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

                          {/* Lock icon and upgrade badge */}
                          {isLocked && (
                            <>
                              <div className="absolute cursor-not-allowed inset-0 bg-black/60 flex items-center justify-center">
                                <div className="text-center">
                                  <Lock className="w-8 h-8 text-white mx-auto mb-2" />
                                  <p className="text-white text-xs font-semibold">
                                    Upgrade to Unlock
                                  </p>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  )
}
