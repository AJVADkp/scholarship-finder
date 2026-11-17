import { createClient } from '@/lib/supabase/server'
import { createClient as createBrowserClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { type Scholarship, CATEGORY_CONFIG } from '@/lib/types'
import { formatAmount, formatDeadline, getDaysUntilDeadline } from '@/lib/utils'
import { DeadlineBadge } from '@/components/ui/DeadlineBadge'
import { CategoryBadge } from '@/components/ui/CategoryBadge'
import { ScholarshipCard } from '@/components/scholarship/ScholarshipCard'
import { Footer } from '@/components/layout/Footer'
import { SaveButton } from './SaveButton'
import {
  ExternalLink, MapPin, GraduationCap, Calendar, DollarSign,
  Building, Tag, Info, CheckCircle, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export const dynamicParams = true

// Generate static pages at build time when Supabase credentials are present
export async function generateStaticParams() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    return []
  }

  try {
    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
    const { data } = await supabase
      .from('scholarships')
      .select('id')
      .eq('is_active', true)

    return (data || []).map((scholarship) => ({
      id: scholarship.id,
    }))
  } catch (err) {
    console.warn('[StaticParams] Pre-rendering scholarship routes skipped:', err)
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('scholarships').select('title, description, provider').eq('id', id).single()

  return {
    title: data?.title || 'Scholarship Details',
    description: data?.description?.slice(0, 160) || `${data?.title} offered by ${data?.provider}`,
    openGraph: {
      title: data?.title || 'Scholarship',
      description: data?.description?.slice(0, 160) || '',
    },
  }
}

export default async function ScholarshipDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: scholarship, error } = await supabase
    .from('scholarships')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !scholarship) notFound()

  const s = scholarship as Scholarship
  const days = getDaysUntilDeadline(s.deadline)
  const catConfig = s.category ? CATEGORY_CONFIG[s.category as keyof typeof CATEGORY_CONFIG] : null

  // Related scholarships
  const { data: related } = await supabase
    .from('scholarships')
    .select('*')
    .eq('category', s.category || '')
    .eq('is_active', true)
    .neq('id', s.id)
    .order('deadline', { ascending: true })
    .limit(3)

  // Removed server-side auth check to allow full static generation
  // SaveButton now handles its own auth fetching on the client side

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <Link href="/scholarships" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-6 no-underline transition-colors">
          <ArrowLeft size={16} /> Back to Scholarships
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Header card */}
            <div className="glass-card p-7" style={{ borderLeft: `5px solid ${catConfig?.color || '#4F8EF7'}` }}>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <CategoryBadge category={s.category} />
                <DeadlineBadge deadline={s.deadline} />
                {!s.is_active && (
                  <span className="text-xs bg-gray-100 text-gray-400 px-3 py-1 rounded-full font-semibold">Inactive</span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
                {s.title}
              </h1>

              <div className="flex items-center gap-2 text-gray-500 mb-5">
                <Building size={15} />
                <span className="font-medium">{s.provider || 'Unknown Provider'}</span>
              </div>

              {/* Key info pills */}
              <div className="flex flex-wrap gap-3 mb-5">
                <div className="glass-panel px-4 py-2.5 flex items-center gap-2">
                  <DollarSign size={15} className="text-emerald-500" />
                  <div>
                    <div className="text-xs text-gray-400 font-medium">Amount</div>
                    <div className="font-bold text-gray-900">{formatAmount(s.amount, s.currency)}</div>
                  </div>
                </div>

                <div className="glass-panel px-4 py-2.5 flex items-center gap-2">
                  <Calendar size={15} className="text-amber-500" />
                  <div>
                    <div className="text-xs text-gray-400 font-medium">Deadline</div>
                    <div className="font-bold text-gray-900">{formatDeadline(s.deadline)}</div>
                  </div>
                </div>

                {s.min_marks_percentage !== null && (
                  <div className="glass-panel px-4 py-2.5 flex items-center gap-2">
                    <GraduationCap size={15} className="text-blue-500" />
                    <div>
                      <div className="text-xs text-gray-400 font-medium">Min. Marks</div>
                      <div className="font-bold text-gray-900">{s.min_marks_percentage}%</div>
                    </div>
                  </div>
                )}

                {s.country && (
                  <div className="glass-panel px-4 py-2.5 flex items-center gap-2">
                    <MapPin size={15} className="text-red-400" />
                    <div>
                      <div className="text-xs text-gray-400 font-medium">Country</div>
                      <div className="font-bold text-gray-900">
                        {s.state ? `${s.state}, ` : ''}{s.country}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                {s.application_link && (
                  <a
                    href={s.application_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary px-6 py-3 gap-2"
                    id="apply-now-button"
                  >
                    Apply Now <ExternalLink size={15} />
                  </a>
                )}
                <SaveButton scholarshipId={s.id} />
              </div>
            </div>

            {/* Description */}
            {s.description && (
              <div className="glass-card p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                  <Info size={18} className="text-primary" /> About this Scholarship
                </h2>
                <p className="text-gray-600 leading-relaxed text-sm">{s.description}</p>
              </div>
            )}

            {/* Eligibility */}
            {s.eligibility_criteria && (
              <div className="glass-card p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                  <CheckCircle size={18} className="text-emerald-500" /> Eligibility Criteria
                </h2>
                <p className="text-gray-600 leading-relaxed text-sm">{s.eligibility_criteria}</p>
              </div>
            )}

            {/* Tags */}
            {s.tags && s.tags.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="font-bold text-gray-900 text-base mb-3 flex items-center gap-2">
                  <Tag size={16} className="text-gray-400" /> Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {s.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-500 text-xs font-semibold rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            {/* Quick apply CTA */}
            <div className="glass-card p-5 text-center" style={{ background: `${catConfig?.color || '#4F8EF7'}08` }}>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"
                style={{ background: `${catConfig?.color || '#4F8EF7'}15` }}
              >
                {catConfig?.emoji || '🎓'}
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Ready to Apply?</h3>
              <p className="text-sm text-gray-500 mb-4">
                {days !== null && days >= 0
                  ? `${days} days left to apply`
                  : 'Check official website for deadline'}
              </p>
              {s.application_link && (
                <a
                  href={s.application_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full justify-center py-3"
                >
                  Apply Now <ExternalLink size={14} />
                </a>
              )}
            </div>

            {/* Deadline info */}
            <div className="glass-card p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Deadline Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Closes on</span>
                  <span className="font-semibold text-gray-700">{formatDeadline(s.deadline)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Days remaining</span>
                  <DeadlineBadge deadline={s.deadline} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Scholarships */}
        {related && related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-extrabold text-gray-900 mb-6">
              More {s.category} Scholarships
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((r) => (
                <ScholarshipCard key={r.id} scholarship={r as Scholarship} showSaveButton={false} />
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
