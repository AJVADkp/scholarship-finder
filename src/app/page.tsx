import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ScholarshipCard } from '@/components/scholarship/ScholarshipCard'
import { Footer } from '@/components/layout/Footer'
import { SkeletonStatCard } from '@/components/ui/SkeletonCard'
import { ALL_CATEGORIES, CATEGORY_CONFIG, type Category } from '@/lib/types'
import Link from 'next/link'
import Script from 'next/script'
import { Search, ArrowRight, Sparkles, Globe, Users, BookOpen, GraduationCap } from 'lucide-react'
import { HeroSearchInput } from '@/components/ui/HeroSearchInput'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'ScholarSearch — Find Your Perfect Scholarship',
  description: 'Discover thousands of scholarships tailored to your academic profile. Search and filter by category, marks, deadline, and country.',
}

export const revalidate = 60 // Refresh stats every 60 seconds

async function StatsRow() {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  const [{ count: totalCount }, { count: totalUsers }] = await Promise.all([
    supabase.from('scholarships').select('*', { count: 'exact', head: true }).eq('is_active', true),
    adminSupabase.from('users').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
      {[
        { icon: BookOpen, value: totalCount || '20+', label: 'Active Scholarships', color: '#4F8EF7' },
        { icon: Sparkles, value: '15+', label: 'Smart Filters', color: '#34C48B' },
        { icon: Users, value: totalUsers || '10+', label: 'Registered Students', color: '#8B5CF6' },
      ].map((stat) => (
        <div key={stat.label} className="stat-card">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: `${stat.color}18` }}
          >
            <stat.icon size={20} style={{ color: stat.color }} />
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mb-1">{stat.value}</div>
          <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

async function FeaturedScholarships({ category }: { category?: string }) {
  const supabase = await createClient()

  let query = supabase
    .from('scholarships')
    .select('*')
    .eq('is_active', true)
    .order('deadline', { ascending: true })
    .limit(6)

  if (category && category !== 'All') {
    query = query.eq('category', category)
  }

  const { data: scholarships, error } = await query

  if (error || !scholarships) {
    return (
      <div className="glass-card p-8 text-center text-gray-500">
        <p>Unable to load scholarships. Please try again later.</p>
      </div>
    )
  }

  if (scholarships.length === 0) {
    return (
      <div className="glass-card p-12 text-center col-span-3">
        <GraduationCap size={48} className="text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">No scholarships found in this category.</p>
      </div>
    )
  }

  return (
    <>
      {scholarships.map((scholarship) => (
        <ScholarshipCard key={scholarship.id} scholarship={scholarship as any} />
      ))}
    </>
  )
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const activeCategory = params.category || 'All'

  return (
    <>
      {/* ========================================================
          HERO SECTION
      ======================================================== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-6 text-sm font-semibold text-primary">
            <Sparkles size={14} />
            20+ Scholarships and Counting
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-5">
            Find Your{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent font-black relative z-10">
                Perfect Scholarship
              </span>
              {/* Highlight swoosh underneath */}
              <span className="absolute bottom-1 left-0 w-full h-3 bg-emerald-100/80 -z-10 rounded-full" />
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover merit, need-based, sports, research, government, and international scholarships.
            Filter by marks, deadline, and country — all in one place.
          </p>

          {/* Search Bar */}
          <div className="glass-card p-3 max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 mb-8">
            <div className="flex-1 flex items-center gap-3 bg-white/60 rounded-xl px-4 py-3">
              <Search size={18} className="text-gray-400 flex-shrink-0" />
              <HeroSearchInput />
            </div>
            <Link
              href="/scholarships"
              className="btn-primary px-6 py-3 justify-center sm:justify-start"
            >
              Search <ArrowRight size={16} />
            </Link>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/scholarships" className="btn-ghost">
              <BookOpen size={16} /> Browse All
            </Link>
            <Link href="#featured" className="btn-ghost">
              <Sparkles size={16} /> Featured
            </Link>
          </div>

          {/* Stats */}
          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
                {[1, 2, 3].map((i) => <SkeletonStatCard key={i} />)}
              </div>
            }
          >
            <StatsRow />
          </Suspense>
        </div>
      </section>

      {/* ========================================================
          FEATURED SCHOLARSHIPS
      ======================================================== */}
      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">Featured Scholarships</h2>
            <p className="text-gray-500 text-sm">Sorted by nearest deadline first</p>
          </div>
          <Link href="/scholarships" className="btn-primary text-sm px-4 py-2">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {['All', ...ALL_CATEGORIES].map((cat) => (
            <Link
              key={cat}
              href={cat === 'All' ? '/#featured' : `/?category=${cat}#featured`}
              scroll={false}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 no-underline border ${
                activeCategory === cat
                  ? 'bg-gray-200 text-gray-900 border-transparent shadow-sm'
                  : 'glass-card text-gray-600 hover:text-primary hover:border-primary/30'
              }`}
            >
              {cat !== 'All' && CATEGORY_CONFIG[cat as Category]?.emoji + ' '}{cat}
            </Link>
          ))}
        </div>

        {/* Scholarship grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Suspense
            fallback={
              <>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="glass-card p-6 h-64 animate-pulse" />
                ))}
              </>
            }
          >
            <FeaturedScholarships category={activeCategory} />
          </Suspense>
        </div>

        {/* View more CTA */}
        <div className="text-center mt-10">
          <Link href="/scholarships" className="btn-primary px-8 py-3">
            Explore All Scholarships <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ========================================================
          HOW IT WORKS
      ======================================================== */}
      <section className="py-16 bg-white/30 backdrop-blur-sm border-y border-white/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">How ScholarSearch Works</h2>
          <p className="text-gray-500 mb-12 max-w-xl mx-auto">Three simple steps to find and apply for your scholarship</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: Search,
                title: 'Search & Filter',
                desc: 'Use our powerful search and filters to find scholarships that match your profile, marks, and goals.',
                color: '#4F8EF7',
              },
              {
                step: '02',
                icon: GraduationCap,
                title: 'Upload Your Marks',
                desc: "Sign in and upload your mark sheet. We'll instantly show you all scholarships you qualify for.",
                color: '#34C48B',
              },
              {
                step: '03',
                icon: ArrowRight,
                title: 'Apply Directly',
                desc: 'Click "Apply Now" to go directly to the official scholarship application page. No middlemen.',
                color: '#8B5CF6',
              },
            ].map((item) => (
              <div key={item.step} className="glass-card p-7 text-center animate-slide-up">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-black text-lg"
                  style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}99)` }}
                >
                  <item.icon size={24} />
                </div>
                <div className="text-xs font-bold text-gray-300 mb-2">STEP {item.step}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
