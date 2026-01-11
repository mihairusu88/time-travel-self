'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import ImageFallback from '@/components/ui/image-fallback'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  BanknoteX,
  CalendarIcon,
  ImageIcon,
  ImagePlusIcon,
  RefreshCcw,
  Download,
  HardDrive,
  Trash2,
  Facebook,
  Twitter,
  Link2,
  Loader2,
} from 'lucide-react'
import {
  formatDistanceToNow,
  format,
  isToday,
  isYesterday,
  isThisYear,
} from 'date-fns'
import { useIsMobile } from '@/hooks/use-mobile'

interface Generation {
  id: string
  title: string | null
  status: string
  image_url: string | null
  uploaded_image_url: string | null
  error: string | null
  file_size: string | null
  prediction_id: string | null
  created_at: string
}

const GENERATIONS_PER_PAGE = 6

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [generationToDelete, setGenerationToDelete] = useState<string | null>(
    null
  )
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    title: string | null
    generationId: string
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const isMobile = useIsMobile()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Fetch user generations (initial load only)
  useEffect(() => {
    const fetchGenerations = async () => {
      if (!user) return

      try {
        const response = await fetch(
          `/api/generations?page=1&limit=${GENERATIONS_PER_PAGE}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch generations')
        }

        const data = await response.json()
        setGenerations(data.generations || [])
        setHasMore(data.pagination?.hasMore || false)
        setTotalCount(data.pagination?.total || 0)
        setCurrentPage(1)
      } catch (error) {
        console.error('Error fetching generations:', error)
        toast.error('Failed to Load Generations', {
          description: 'Could not load your generated images',
          duration: 4000,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchGenerations()
  }, [user])

  // Auto-poll for in-progress generations
  useEffect(() => {
    const hasInProgress = generations.some(g =>
      ['starting', 'processing'].includes(g.status)
    )

    if (!hasInProgress || !user) return

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch('/api/generations')
        if (response.ok) {
          const data = await response.json()
          setGenerations(data.generations || [])
        }
      } catch (error) {
        console.error('Error auto-polling:', error)
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(intervalId)
  }, [generations, user])

  const handleRefreshStatus = async (generationId: string) => {
    setRefreshing(generationId)

    try {
      const response = await fetch('/api/generations')

      if (!response.ok) {
        throw new Error('Failed to refresh')
      }

      const data = await response.json()
      setGenerations(data.generations || [])

      toast.success('Status Updated', {
        description: 'Generation status refreshed',
        duration: 2000,
      })
    } catch (error) {
      console.error('Error refreshing:', error)
      toast.error('Refresh Failed', {
        description: 'Could not refresh status',
        duration: 3000,
      })
    } finally {
      setRefreshing(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours =
      Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)

    // If less than 24 hours, show relative time
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true })
    }

    // If today or yesterday
    if (isToday(date)) {
      return `Today, ${format(date, 'HH:mm')}`
    }

    if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'HH:mm')}`
    }

    // If less than 7 days, show "X days ago"
    if (diffInHours < 24 * 7) {
      return formatDistanceToNow(date, { addSuffix: true })
    }

    // If this year, show date with time
    if (isThisYear(date)) {
      return format(date, 'MMM dd, HH:mm')
    }

    // Otherwise show full date with time
    return format(date, 'yyyy-MM-dd, HH:mm')
  }

  const handleDeleteClick = (generationId: string) => {
    setGenerationToDelete(generationId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!generationToDelete) return

    setDeleting(generationToDelete)

    try {
      const response = await fetch('/api/delete-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ generationId: generationToDelete }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete generation')
      }

      toast.success('Generation Deleted', {
        description: 'Your generation has been permanently deleted',
        duration: 3000,
      })

      // Remove from local state
      setGenerations(prev => prev.filter(gen => gen.id !== generationToDelete))
      setTotalCount(prev => prev - 1)
    } catch (error) {
      console.error('Error deleting:', error)
      toast.error('Delete Failed', {
        description: 'Could not delete generation. Please try again.',
        duration: 4000,
      })
    } finally {
      setDeleting(null)
      setDeleteDialogOpen(false)
      setGenerationToDelete(null)
    }
  }

  const handleLoadMore = async () => {
    if (!hasMore || loadingMore) return

    setLoadingMore(true)
    const nextPage = currentPage + 1

    try {
      const response = await fetch(
        `/api/generations?page=${nextPage}&limit=${GENERATIONS_PER_PAGE}`
      )

      if (!response.ok) {
        throw new Error('Failed to load more generations')
      }

      const data = await response.json()
      setGenerations(prev => [...prev, ...(data.generations || [])])
      setHasMore(data.pagination?.hasMore || false)
      setCurrentPage(nextPage)
    } catch (error) {
      console.error('Error loading more:', error)
      toast.error('Failed to Load More', {
        description: 'Could not load more generations',
        duration: 3000,
      })
    } finally {
      setLoadingMore(false)
    }
  }

  const handleDownload = async (imageUrl: string, generationId: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hero-image-${generationId}-${Date.now()}.png`
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

  const handleCopyUrl = (imageUrl: string) => {
    navigator.clipboard.writeText(imageUrl)
    toast.success('Link Copied!', {
      description: 'Image link copied to clipboard',
      duration: 3000,
    })
  }

  const handleShare = (platform: string, imageUrl: string) => {
    const text = 'Check out my awesome hero image!'
    const encodedUrl = encodeURIComponent(imageUrl)
    const encodedText = encodeURIComponent(text)

    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    }

    window.open(shareUrls[platform], '_blank', 'noopener,noreferrer')
  }

  const handleImageClick = (
    imageUrl: string,
    title: string | null,
    generationId: string
  ) => {
    if (!isMobile) {
      setSelectedImage({
        url: imageUrl,
        title: title,
        generationId: generationId,
      })
      setImageModalOpen(true)
    }
  }

  const handleModalDownload = async () => {
    if (!selectedImage) return
    await handleDownload(selectedImage.url, selectedImage.generationId)
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      starting: { text: 'Starting', class: 'bg-blue-600' },
      processing: { text: 'Processing', class: 'bg-yellow-600 animate-pulse' },
      succeeded: { text: 'Completed', class: 'bg-green-600' },
      failed: { text: 'Failed', class: 'bg-red-600' },
    }

    return (
      badges[status as keyof typeof badges] || {
        text: status,
        class: 'bg-gray-500',
      }
    )
  }

  // Show loading state while checking auth
  if (authLoading || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-background">
        <div className="text-center">
          <div className="mb-6 h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Loading Heroes...
          </h2>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!user) {
    return null
  }

  const hasGenerations = generations.length > 0

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100 dark:bg-background font-display text-gray-800 dark:text-gray-200">
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-4xl font-bold tracking-tighter text-gray-900 dark:text-white">
              My Hero Images
            </h2>
            <Link href="/generate">
              <Button className="flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-bold text-white shadow-lg shadow-primary/30 transition-transform duration-300 hover:scale-105">
                <ImagePlusIcon className="w-5 h-5" />
                <span>Generate New Image</span>
              </Button>
            </Link>
          </div>

          {!hasGenerations ? (
            <div className="bg-card border border-gray-200 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center py-16 text-center">
              <ImageIcon className="w-24 h-24 text-gray-300 dark:text-gray-700 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No Generations Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                Start creating your first hero image by clicking the button
                above!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {generations.map(generation => {
                const statusBadge = getStatusBadge(generation.status)
                const isProcessing = ['starting', 'processing'].includes(
                  generation.status
                )
                const hasFailed = generation.status === 'failed'
                const displayImage =
                  generation.image_url || generation.uploaded_image_url

                return (
                  <div
                    key={generation.id}
                    className="group relative flex flex-col gap-3 overflow-hidden rounded-xl bg-card ring-1 ring-gray-200 dark:ring-gray-800 transition-all duration-300 dark:bg-background-dark/50 hover:ring-2 hover:ring-primary dark:hover:ring-primary"
                  >
                    {/* Status Badge */}
                    <div className="absolute top-3 left-2 z-10 rounded-full">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-white ${statusBadge.class} shadow-sm shadow-gray-200 dark:shadow-gray-800`}
                      >
                        {statusBadge.text}
                      </span>
                    </div>

                    {/* Download Button (only for completed) */}
                    {generation.status === 'succeeded' &&
                      generation.image_url && (
                        <Button
                          onClick={e => {
                            e.stopPropagation()
                            handleDownload(generation.image_url!, generation.id)
                          }}
                          className="absolute top-2 right-14 z-10 p-2 rounded-full transition-colors shadow-lg"
                          aria-label="Download image"
                        >
                          <Download className="w-4 h-4 text-white" />
                        </Button>
                      )}

                    {/* Delete Button (for all generations) */}
                    <Button
                      onClick={e => {
                        e.stopPropagation()
                        handleDeleteClick(generation.id)
                      }}
                      disabled={deleting === generation.id}
                      className="absolute top-2 right-2 z-10 p-2 rounded-full bg-red-500 hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50"
                      aria-label="Delete generation"
                    >
                      {deleting === generation.id ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-white" />
                      )}
                    </Button>

                    {/* Refresh Button for In-Progress */}
                    {isProcessing && (
                      <Button
                        onClick={e => {
                          e.stopPropagation()
                          handleRefreshStatus(generation.id)
                        }}
                        disabled={refreshing === generation.id}
                        className="absolute top-2 right-14 z-10 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                        aria-label="Refresh status"
                      >
                        <RefreshCcw
                          className={`w-4 h-4 text-gray-700 dark:text-gray-300 ${refreshing === generation.id ? 'animate-spin' : ''}`}
                        />
                      </Button>
                    )}

                    <div className="aspect-square w-full overflow-hidden relative">
                      {hasFailed ? (
                        <div className="flex flex-col items-center justify-center h-full bg-gray-200 dark:bg-gray-800">
                          <BanknoteX className="w-16 h-16 text-red-500 mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400 text-center px-4">
                            {generation.error
                              ? 'An error occurred, please try again.'
                              : 'Generation failed'}
                          </p>
                        </div>
                      ) : displayImage ? (
                        <div
                          className="h-full w-full transition-transform duration-300 group-hover:scale-110 cursor-pointer"
                          onClick={() =>
                            handleImageClick(
                              displayImage,
                              generation.title,
                              generation.id
                            )
                          }
                        >
                          <ImageFallback
                            src={displayImage}
                            alt={generation.title || 'Generated Hero Image'}
                            className={`w-full h-full object-cover ${isProcessing ? 'opacity-50' : ''}`}
                            width={500}
                            height={500}
                            priority={true}
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            placeholder={
                              <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-800">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                              </div>
                            }
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-800">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                        </div>
                      )}
                    </div>

                    <div className="px-4 pb-4 space-y-3">
                      {/* Date and File Size */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(generation.created_at)}
                          </p>
                        </div>
                        {generation.status === 'succeeded' &&
                          generation.file_size && (
                            <div className="flex items-center gap-1.5">
                              <HardDrive className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                {generation.file_size}
                              </p>
                            </div>
                          )}
                      </div>

                      {/* Social Share Buttons */}
                      {generation.status === 'succeeded' &&
                        generation.image_url && (
                          <div className="grid grid-cols-3 gap-2">
                            <Button
                              onClick={e => {
                                e.stopPropagation()
                                handleShare('facebook', generation.image_url!)
                              }}
                              className="flex items-center justify-center p-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
                              aria-label="Share on Facebook"
                            >
                              <Facebook className="w-4 h-4 text-white" />
                            </Button>

                            <Button
                              onClick={e => {
                                e.stopPropagation()
                                handleShare('twitter', generation.image_url!)
                              }}
                              className="flex items-center justify-center p-2 rounded-lg bg-sky-500 hover:bg-sky-600 transition-colors"
                              aria-label="Share on Twitter"
                            >
                              <Twitter className="w-4 h-4 text-white" />
                            </Button>

                            <Button
                              onClick={e => {
                                e.stopPropagation()
                                handleCopyUrl(generation.image_url!)
                              }}
                              className="flex items-center justify-center p-2 rounded-lg bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                              aria-label="Copy URL"
                            >
                              <Link2 className="w-4 h-4 text-white" />
                            </Button>
                          </div>
                        )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && hasGenerations && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-6 text-base font-bold text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <RefreshCcw className="w-5 h-5" />
                    <span>Load More</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Total Count */}
          {hasGenerations && (
            <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
              Showing {generations.length} of {totalCount} generations
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Generation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this generation? This action
              cannot be undone and will permanently remove the image from your
              account and storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Modal */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="sm:max-w-6xl sm:max-h-[90vh] p-4 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>
              {selectedImage?.title || 'Generated Hero Image'}
            </DialogTitle>
          </DialogHeader>
          <div className="relative flex flex-col max-h-full overflow-hidden">
            {/* Download Button */}
            {selectedImage && (
              <Button
                onClick={handleModalDownload}
                className="absolute top-0 left-2 z-10 p-2 rounded-full bg-primary hover:bg-primary/90 transition-colors shadow-lg"
                aria-label="Download image"
              >
                <Download className="w-4 h-4 text-white" />
                <span className="text-white">Download</span>
              </Button>
            )}

            {/* Image */}
            {selectedImage && (
              <div className="flex items-center justify-center max-h-full overflow-hidden">
                <ImageFallback
                  src={selectedImage.url}
                  alt={selectedImage.title || 'Generated Hero Image'}
                  className="max-w-full max-h-full object-contain"
                  width={1000}
                  height={1000}
                  priority={true}
                  sizes="100vw"
                  placeholder={
                    <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-800">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                    </div>
                  }
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
