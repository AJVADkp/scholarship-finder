import { createClient } from '@/lib/supabase/server'
import { ScholarshipCard } from '@/components/scholarship/ScholarshipCard'
import { Footer } from '@/components/layout/Footer'
import { type Scholarship, type Category, CATEGORY_CONFIG } from '@/lib/types'
import { GraduationCap } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ category: string }>
}

function normalizeCategory(slug: string): Category | null {
  const map: Record<string, Category> = {
    merit: 'Merit',
    'need-based': 'Need-based',
    sports: 'Sports',
    research: 'Research',
    government: 'Government',
    international: 'International',
  }
  return map[slug.toLowerCase()] || null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const cat = normalizeCategory(category)
  return {
    title: cat ? `${cat} Scholarships` : 'Category',
    description: cat ? `Browse all ${cat} scholarships on ScholarSearch.` : 'Scholarships by category',
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params
  const cat = normalizeCategory(category)

  if (!cat) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <GraduationCap size={64} className="text-gray-200 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-700 mb-4">Category not found</h1>
        <Link href="/scholarships" className="btn-primary px-6 py-2.5">Browse All</Link>
      </div>
    )
  }

  const config = CATEGORY_CONFIG[cat]
  const supabase = await createClient()

  const { data: scholarships } = await supabase
    .from('scholarships')
    .select('*')
    .eq('category', cat)
    .eq('is_active', true)
    .order('deadline', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      {/* Hero */}
      <section
        className="py-16 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${config.color}18 0%, ${config.color}08 50%, transparent 100%)`,
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 text-4xl shadow-lg"
            style={{ background: `linear-gradient(135deg, ${config.color}25, ${config.color}10)`, border: `2px solid ${config.color}30` }}
          >
            {config.emoji}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            {cat} Scholarships
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto mb-6">
            Explore all {cat.toLowerCase()} scholarships available on ScholarSearch.
            {scholarships ? ` ${scholarships.length} scholarships found.` : ''}
          </p>
          <Link href="/scholarships" className="btn-ghost px-5 py-2">
            ← All Categories
          </Link>
        </div>
      </section>

      {/* Scholarships grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {!scholarships || scholarships.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <GraduationCap size={64} className="text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">No {cat} scholarships yet</h2>
            <p className="text-gray-400 mb-6">Check back later or browse all scholarships.</p>
            <Link href="/scholarships" className="btn-primary px-6 py-2.5">Browse All</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {scholarships.map((s) => (
              <ScholarshipCard
                key={s.id}
                scholarship={s as Scholarship}
                showSaveButton={!!user}
                userId={user?.id || null}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
