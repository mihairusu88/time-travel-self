'use client'

interface UploadAreaProps {
  uploadedImage: string
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onImageClick: () => void
}

export const UploadArea = ({
  uploadedImage,
  fileInputRef,
  onImageUpload,
  onImageClick,
}: UploadAreaProps) => {
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onImageUpload}
        className="hidden"
      />
      <div
        onClick={onImageClick}
        className="w-40 h-40 rounded-xl bg-cover bg-center cursor-pointer relative border-2 border-dashed border-primary/30 hover:border-primary transition-colors overflow-hidden group"
        style={
          uploadedImage ? { backgroundImage: `url("${uploadedImage}")` } : {}
        }
      >
        {!uploadedImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/50">
            <svg
              className="w-12 h-12 text-primary mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <p className="text-sm text-primary font-bold text-center px-2">
              Upload Photo
            </p>
          </div>
        )}
        {uploadedImage && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <p className="text-white font-bold text-sm">Change Photo</p>
          </div>
        )}
      </div>
    </>
  )
}
