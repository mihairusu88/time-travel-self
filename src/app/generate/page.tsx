import { getProps } from '@/lib/propsLoader'
import { getTemplates } from '@/lib/templatesLoader'
import GenerateClient from './GenerateClient'

export default async function GeneratePage() {
  // Load props and templates from Supabase Storage server-side
  const [propCategories, templateCategories] = await Promise.all([
    getProps(),
    getTemplates(),
  ])

  return (
    <GenerateClient
      propCategories={propCategories}
      templateCategories={templateCategories}
    />
  )
}
