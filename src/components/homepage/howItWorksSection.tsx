import { Upload, Sparkles, Share2, Palette, Wand2, Zap } from 'lucide-react'

const features = [
  {
    id: 1,
    icon: Upload,
    title: 'Upload Your Photo',
    description:
      'Start by uploading a clear, high-quality photo of yourself or a friend to begin your hero transformation.',
  },
  {
    id: 2,
    icon: Palette,
    title: 'Choose Your Style',
    description:
      'Select from dozens of epic templates and customize with props, accessories, and effects to match your vision.',
  },
  {
    id: 3,
    icon: Wand2,
    title: 'AI Magic Processing',
    description:
      'Our advanced AI seamlessly blends your photo with chosen elements, maintaining perfect face consistency and realistic details.',
  },
  {
    id: 4,
    icon: Sparkles,
    title: 'Instant Generation',
    description:
      'Watch as your heroic image comes to life in seconds with photorealistic quality and cinematic effects.',
  },
  {
    id: 5,
    icon: Zap,
    title: 'Fine-Tune & Adjust',
    description:
      'Customize image quality, aspect ratio, and dimensions to perfectly match your needs and platform requirements.',
  },
  {
    id: 6,
    icon: Share2,
    title: 'Download & Share',
    description:
      'Save your creation in high resolution and share your epic transformation across all your favorite platforms.',
  },
]

export const HowItWorksSection = () => {
  return (
    <section
      className="w-full max-w-7xl mx-auto md:my-20 px-4"
      id="how-it-works"
    >
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-3xl mx-auto">
          Discover the groundbreaking capabilities of Hero Time AI Image
          Creator.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map(feature => {
          const Icon = feature.icon
          return (
            <div
              key={feature.id}
              className="flex flex-col gap-4 rounded-2xl bg-card p-8 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex items-center justify-center size-14 rounded-full bg-primary/10 dark:bg-primary/20 flex-shrink-0">
                <Icon className="size-6 text-primary" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
