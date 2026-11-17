import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const supabase = await createClient()

  const { data: scholarships } = await supabase
    .from('scholarships')
    .select('id, updated_at')
    .eq('is_active', true)

  const scholarshipEntries: MetadataRoute.Sitemap = (scholarships || []).map((s) => ({
    url: `${baseUrl}/scholarships/${s.id}`,
    lastModified: s.updated_at,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const categories = ['merit', 'need-based', 'sports', 'research', 'government', 'international']

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    {
      url: `${baseUrl}/scholarships`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...categories.map((cat) => ({
      url: `${baseUrl}/scholarships/category/${cat}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...scholarshipEntries,
  ]
}
