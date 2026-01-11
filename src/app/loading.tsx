export default function Loading() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-100 dark:bg-background font-display">
      <div className="text-center">
        <div className="mb-6 h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Loading...
        </h2>
      </div>
    </div>
  )
}
