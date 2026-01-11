const testimonials = [
  {
    id: 1,
    name: 'AIArtistPro',
    role: 'Digital Creator',
    initials: 'AI',
    quote:
      '"This editor completely changed my workflow. The character consistency is incredible - miles ahead of Flux Kontext!"',
  },
  {
    id: 2,
    name: 'ContentCreator',
    role: 'UGC Specialist',
    initials: 'CC',
    quote:
      '"Creating consistent AI influencers has never been easier. It maintains perfect face details across edits!"',
  },
  {
    id: 3,
    name: 'PhotoEditor',
    role: 'Professional Editor',
    initials: 'PE',
    quote:
      '"One-shot editing is basically solved with this tool. The scene blending is so natural and realistic!"',
  },
]

export const TestimonialsSection = () => {
  return (
    <section className="w-full max-w-6xl mx-auto md:my-20 px-4">
      <div className="text-center mb-12">
        <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-3">
          Heroes Testimonials
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          What creators are saying
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map(testimonial => (
          <div
            key={testimonial.id}
            className="flex flex-col gap-6 rounded-2xl bg-card p-8 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-14 rounded-full bg-primary text-primary-foreground font-bold text-lg flex-shrink-0">
                {testimonial.initials}
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {testimonial.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {testimonial.role}
                </p>
              </div>
            </div>
            <blockquote className="text-gray-700 dark:text-gray-300 text-base leading-relaxed italic">
              {testimonial.quote}
            </blockquote>
          </div>
        ))}
      </div>
    </section>
  )
}
