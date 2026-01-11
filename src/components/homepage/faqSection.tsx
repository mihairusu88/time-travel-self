import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    question: 'What age groups is HeroTime suitable for?',
    answer:
      'HeroTime is designed for all ages! Our magical stories and adventures are perfect for everyone, sparking imagination at every stage.',
  },
  {
    question: 'How long does it take to create a hero image?',
    answer:
      'Our AI magic works quickly! Most images are ready within 30-60 seconds, depending on the template and customizations you choose.',
  },
  {
    question: 'Is my photo safe and secure?',
    answer:
      'Absolutely! We prioritize your privacy and security. Photos are only used to create your personalized image and are never shared with anyone. See our Privacy Policy for full details.',
  },
  {
    question: 'Can I create images for multiple people?',
    answer:
      'Yes! With our Premium Hero and Royal Court plans, you can create magical adventures for multiple people. Each person gets their own personalized hero journey.',
  },
  {
    question: 'What image quality can I expect?',
    answer:
      'Our Premium plans deliver images without watermarks. Free accounts include gentle watermarks but still provide high-quality magical experiences.',
  },
  {
    question: 'Can I download and share the images?',
    answer:
      'Absolutely! Once your hero image is ready, you can download it and share it with friends on social media, or keep it as a treasured memory.',
  },
]

export const FaqSection = () => {
  return (
    <section className="text-center md:my-12" id="faq">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-12">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="cursor-pointer rounded-xl bg-card !border border-gray-200 dark:border-gray-700 px-6 py-4 text-left"
            >
              <AccordionTrigger className="cursor-pointer font-bold text-lg text-gray-900 dark:text-white hover:text-primary text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="mt-4 text-gray-700 dark:text-gray-300">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
