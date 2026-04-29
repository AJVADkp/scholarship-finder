'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ScholarshipCard } from '@/components/scholarship/ScholarshipCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { Footer } from '@/components/layout/Footer'
import { type Scholarship } from '@/lib/types'
import { BasicFilters, EMPTY_BASIC_FILTERS, type BasicFilterState } from '@/components/search/BasicFilters'
import { AdvancedFilters, EMPTY_ADVANCED_FILTERS, type AdvancedFilterState } from '@/components/search/AdvancedFilters'
import { SearchLoginPrompt } from '@/components/search/SearchLoginPrompt'
import {
  Search, SlidersHorizontal, X, ChevronLeft, ChevronRight,
  GraduationCap, Sparkles, Lock
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'

const ITEMS_PER_PAGE = 12

function countActiveBasicFilters(f: BasicFilterState) {
  return (
    f.academicLevels.length +
    f.streams.length +
    (f.gender ? 1 : 0) +
    (f.state ? 1 : 0) +
    (f.incomeRange ? 1 : 0) +
    f.scholarshipTypes.length
  )
}

function countActiveAdvancedFilters(f: AdvancedFilterState) {
  return (
    (f.casteCategory ? 1 : 0) +
    (f.religion ? 1 : 0) +
    (f.disabilityStatus ? 1 : 0) +
    (f.girlsOnly ? 1 : 0) +
    f.specialBackgrounds.length +
    (f.minAcademicPerformance ? 1 : 0) +
    (f.awardAmountRange ? 1 : 0) +
    (f.applicationStatus ? 1 : 0) +
    f.portalSources.length +
    f.courseSpecializations.length +
    (f.studyMode ? 1 : 0) +
    (f.geographicFocus ? 1 : 0) +
    f.institutionTypes.length +
    (f.yearOfStudy ? 1 : 0) +
    (f.minCollegePerformance ? 1 : 0) +
    (f.applicationType ? 1 : 0)
  )
}

function ScholarshipsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [user, setUser] = useState<User | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [basicFilters, setBasicFilters] = useState<BasicFilterState>(EMPTY_BASIC_FILTERS)
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterState>(EMPTY_ADVANCED_FILTERS)
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [sortBy, setSortBy] = useState<'deadline' | 'amount_desc' | 'amount_asc' | 'newest'>('deadline')

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Init auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase.from('saved_scholarships').select('scholarship_id').eq('user_id', user.id).then(({ data }) => {
          if (data) setSavedIds(new Set(data.map(d => d.scholarship_id)))
        })
      }
    })
  }, [])

  // Read URL params on mount
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) { setSearchQuery(q); setDebouncedQuery(q) }
    const sort = searchParams.get('sort') as typeof sortBy
    if (sort) setSortBy(sort)
  }, [])

  // Debounce search
  useEffect(() => {
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(searchQuery)
      setPage(1)
    }, 300)
    return () => clearTimeout(debounceTimer.current)
  }, [searchQuery])

  // Fetch suggestions
  useEffect(() => {
    if (searchQuery.length < 2) { setSuggestions([]); return }
    supabase
      .from('scholarships')
      .select('title')
      .ilike('title', `%${searchQuery}%`)
      .limit(5)
      .then(({ data }) => setSuggestions(data?.map(d => d.title) || []))
  }, [searchQuery])

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedQuery) params.set('q', debouncedQuery)
    if (sortBy !== 'deadline') params.set('sort', sortBy)
    if (basicFilters.academicLevels.length) params.set('levels', basicFilters.academicLevels.join(','))
    if (basicFilters.streams.length) params.set('streams', basicFilters.streams.join(','))
    if (basicFilters.gender) params.set('gender', basicFilters.gender)
    if (basicFilters.state) params.set('state', basicFilters.state)
    if (basicFilters.incomeRange) params.set('income', basicFilters.incomeRange)
    if (basicFilters.scholarshipTypes.length) params.set('types', basicFilters.scholarshipTypes.join(','))
    if (activeTab === 'advanced' && user) {
      if (advancedFilters.casteCategory) params.set('caste', advancedFilters.casteCategory)
      if (advancedFilters.religion) params.set('religion', advancedFilters.religion)
      if (advancedFilters.disabilityStatus) params.set('disability', advancedFilters.disabilityStatus)
      if (advancedFilters.girlsOnly) params.set('girls', '1')
      if (advancedFilters.applicationStatus) params.set('appstatus', advancedFilters.applicationStatus)
      if (advancedFilters.awardAmountRange) params.set('award', advancedFilters.awardAmountRange)
      if (advancedFilters.geographicFocus) params.set('geo', advancedFilters.geographicFocus)
      if (advancedFilters.studyMode) params.set('mode', advancedFilters.studyMode)
      if (advancedFilters.yearOfStudy) params.set('year', advancedFilters.yearOfStudy)
      if (advancedFilters.applicationType) params.set('apptype', advancedFilters.applicationType)
    }
    const url = params.toString() ? `?${params.toString()}` : '/scholarships'
    router.replace(url, { scroll: false })
  }, [debouncedQuery, sortBy, basicFilters, advancedFilters, activeTab, user, router])

  // Build and run the query
  const fetchScholarships = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('scholarships')
        .select('*', { count: 'exact' })
        .eq('is_active', true)

      // Text search
      if (debouncedQuery) {
        query = query.or(
          `title.ilike.%${debouncedQuery}%,provider.ilike.%${debouncedQuery}%,description.ilike.%${debouncedQuery}%`
        )
      }

      // ============================================
      // BASIC FILTERS — Smart Inclusion/Exclusion
      // ============================================

      // Academic Levels: Show matching + scholarships open to ALL levels (null)
      if (basicFilters.academicLevels.length > 0) {
        const levelsFilter = basicFilters.academicLevels
          .map(l => `academic_levels.cs.{${l}}`)
          .join(',')
        query = query.or(`academic_levels.is.null,${levelsFilter}`)
      }

      // Streams: Show matching + "All" streams + null (open to all)
      if (basicFilters.streams.length > 0) {
        const streamsFilter = basicFilters.streams
          .map(s => `streams.cs.{${s}}`)
          .join(',')
        query = query.or(`streams.is.null,streams.cs.{All},${streamsFilter}`)
      }

      // Gender — Smart Exclusion
      // Male: exclude Female-only scholarships
      // Female: show Female + All + null
      if (basicFilters.gender === 'Male') {
        query = query.neq('gender_eligibility', 'Female')
      } else if (basicFilters.gender === 'Female') {
        query = query.or('gender_eligibility.eq.All,gender_eligibility.eq.Female,gender_eligibility.is.null')
      }

      // State — Smart Inclusion
      // Show: selected state + All India + null (national scholarships)
      // Exclude: scholarships for other specific states
      if (basicFilters.state) {
        query = query.or(
          `state.is.null,state.eq.All India,state.ilike.%${basicFilters.state}%`
        )
      }

      // Income — Show matching range + null (no income restriction)
      if (basicFilters.incomeRange) {
        query = query.or(`income_range.is.null,income_range.eq.Not specified,income_range.eq.${basicFilters.incomeRange}`)
      }

      // Category/Type — Show matching + null (open to all categories)
      if (basicFilters.scholarshipTypes.length > 0) {
        query = query.or(
          `category.is.null,${basicFilters.scholarshipTypes.map(t => `category.eq.${t}`).join(',')}`
        )
      }

      // ============================================
      // ADVANCED FILTERS — Smart Inclusion/Exclusion
      // ============================================
      if (user && activeTab === 'advanced') {

        // Caste — Show matching + null (no caste restriction) + General always eligible
        if (advancedFilters.casteCategory) {
          query = query.or(
            `caste_categories.is.null,caste_categories.cs.{${advancedFilters.casteCategory}},caste_categories.cs.{General}`
          )
        }

        // Religion — Show matching + "Any" + null (no religion restriction)
        if (advancedFilters.religion && advancedFilters.religion !== 'No preference') {
          query = query.or(
            `religion.is.null,religion.eq.Any,religion.ilike.%${advancedFilters.religion}%`
          )
        }

        // Disability — Smart Exclusion
        // PwD selected: show ONLY disability scholarships
        // No disability: EXCLUDE disability-only scholarships
        if (advancedFilters.disabilityStatus === 'Person with Disability (PwD) — 40%+') {
          query = query.eq('disability_required', true)
        } else if (advancedFilters.disabilityStatus === 'No disability') {
          query = query.or('disability_required.is.null,disability_required.eq.false')
        }

        // Girls Only Toggle — show only girls_only scholarships
        if (advancedFilters.girlsOnly && basicFilters.gender !== 'Male') {
          query = query.eq('girls_only', true)
        }

        // Special Backgrounds — Show matching + null (open to all)
        if (advancedFilters.specialBackgrounds.length > 0) {
          query = query.or(
            `special_backgrounds.is.null,${advancedFilters.specialBackgrounds.map(b => `special_backgrounds.cs.{${b}}`).join(',')}`
          )
        }

        // Award Amount Range — exact match only
        if (advancedFilters.awardAmountRange) {
          query = query.eq('award_amount_range', advancedFilters.awardAmountRange)
        }

        // Application Status — Show matching + null
        if (advancedFilters.applicationStatus && advancedFilters.applicationStatus !== 'Both') {
          query = query.or(`application_status.is.null,application_status.eq.Open,application_status.eq.${advancedFilters.applicationStatus}`)
        }

        // Portal Sources — Show matching + null
        if (advancedFilters.portalSources.length > 0) {
          query = query.overlaps('portal_source', advancedFilters.portalSources)
        }

        // Course Specializations — Show matching + null
        if (advancedFilters.courseSpecializations.length > 0) {
          query = query.or(
            `course_specializations.is.null,${advancedFilters.courseSpecializations.map(c => `course_specializations.cs.{${c}}`).join(',')}`
          )
        }

        // Study Mode — Show matching + "Any" + null
        if (advancedFilters.studyMode && advancedFilters.studyMode !== 'Any') {
          query = query.or(`study_mode.is.null,study_mode.eq.Any,study_mode.eq.${advancedFilters.studyMode}`)
        }

        // Geographic Focus — Show matching + "Both" + null
        if (advancedFilters.geographicFocus && advancedFilters.geographicFocus !== 'Both') {
          query = query.or(`geographic_focus.is.null,geographic_focus.eq.Both,geographic_focus.eq.${advancedFilters.geographicFocus}`)
        }

        // Institution Types — Show matching + null
        if (advancedFilters.institutionTypes.length > 0) {
          query = query.or(
            `institution_types.is.null,${advancedFilters.institutionTypes.map(i => `institution_types.cs.{${i}}`).join(',')}`
          )
        }

        // Application Type — Show matching + "Both" + null
        if (advancedFilters.applicationType && advancedFilters.applicationType !== 'Both') {
          query = query.or(`application_type.is.null,application_type.eq.Both,application_type.eq.${advancedFilters.applicationType}`)
        }
      }


      // Sort
      if (sortBy === 'deadline') query = query.order('deadline', { ascending: true, nullsFirst: false })
      else if (sortBy === 'amount_desc') query = query.order('amount', { ascending: false })
      else if (sortBy === 'amount_asc') query = query.order('amount', { ascending: true })
      else if (sortBy === 'newest') query = query.order('created_at', { ascending: false })

      // Pagination
      const from = (page - 1) * ITEMS_PER_PAGE
      query = query.range(from, from + ITEMS_PER_PAGE - 1)

      const { data, count, error } = await query
      if (error) throw error
      setScholarships(data as Scholarship[])
      setTotalCount(count || 0)
    } catch (err: any) {
      setError(err?.message || 'Failed to load scholarships.')
    } finally {
      setLoading(false)
    }
  }, [debouncedQuery, basicFilters, advancedFilters, activeTab, user, sortBy, page])

  useEffect(() => { fetchScholarships() }, [fetchScholarships])

  const clearAll = () => {
    setSearchQuery('')
    setDebouncedQuery('')
    setBasicFilters(EMPTY_BASIC_FILTERS)
    setAdvancedFilters(EMPTY_ADVANCED_FILTERS)
    setSortBy('deadline')
    setPage(1)
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
  const activeBasicCount = countActiveBasicFilters(basicFilters)
  const activeAdvancedCount = user ? countActiveAdvancedFilters(advancedFilters) : 0
  const totalActiveFilters = activeBasicCount + activeAdvancedCount
  const hasFilters = totalActiveFilters > 0 || debouncedQuery

  // Zero result suggestions
  const zeroResultSuggestion = () => {
    if (activeAdvancedCount > 3) return 'Try clearing some Advanced Filters like caste, religion, or disability status.'
    if (activeBasicCount > 3) return 'Try removing a few filters — for example try clearing the Income Range or Gender filter.'
    if (basicFilters.streams.length > 0) return 'Try selecting fewer streams or removing the stream filter entirely.'
    if (basicFilters.state) return 'Try removing the State filter to see Pan-India scholarships.'
    return 'Try clearing all filters to see all available scholarships.'
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Browse Scholarships</h1>
          <p className="text-gray-500 text-sm">
            {loading ? 'Searching...' : `${totalCount} scholarship${totalCount !== 1 ? 's' : ''} found`}
            {hasFilters && !loading && (
              <button onClick={clearAll} className="ml-3 text-primary hover:underline font-semibold text-xs">
                Clear all filters
              </button>
            )}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-5 relative">
          <div className="flex items-center gap-3 glass-card px-5 py-4 w-full">
            <Search size={20} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by name, provider, or keyword..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true) }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onFocus={() => setShowSuggestions(true)}
              className="bg-transparent outline-none text-base text-gray-700 placeholder-gray-400 w-full font-medium"
              id="scholarship-search"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-300 hover:text-gray-500">
                <X size={18} />
              </button>
            )}
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 glass-card p-2 z-20 animate-scale-in shadow-xl">
              {suggestions.map(s => (
                <button key={s}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl flex items-center gap-3"
                  onClick={() => { setSearchQuery(s); setShowSuggestions(false) }}
                >
                  <Search size={14} className="text-gray-300" />
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full btn-ghost flex items-center justify-center gap-2 px-4 py-3"
          >
            <SlidersHorizontal size={16} />
            Filters & Sorting
            {totalActiveFilters > 0 && (
              <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center ml-1">
                {totalActiveFilters}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className={`${
            sidebarOpen ? 'fixed inset-0 z-50 p-4 overflow-y-auto bg-white/90 backdrop-blur-sm' : 'hidden'
          } lg:block lg:static lg:z-auto lg:p-0 lg:overflow-visible lg:bg-transparent lg:backdrop-blur-none`}>
            {sidebarOpen && (
              <div className="absolute inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />
            )}
            <div className={`relative glass-card p-5 w-72 ${sidebarOpen ? 'ml-auto' : ''} lg:w-64 xl:w-72 flex-shrink-0`}>
              {/* Sidebar Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={15} className="text-gray-600" />
                  <span className="font-bold text-gray-900 text-sm">Filters</span>
                  {totalActiveFilters > 0 && (
                    <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                      {totalActiveFilters}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasFilters && (
                    <button onClick={clearAll} className="text-xs text-primary hover:underline font-semibold">
                      Reset all
                    </button>
                  )}
                  <button className="lg:hidden text-gray-400" onClick={() => setSidebarOpen(false)}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Sort */}
              <div className="mb-5 pb-5 border-b border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={e => { setSortBy(e.target.value as typeof sortBy); setPage(1) }}
                  className="input-glass text-sm py-2.5 w-full cursor-pointer"
                  id="sort-select"
                >
                  <option value="deadline">⏰ Deadline (soonest)</option>
                  <option value="amount_desc">💰 Amount (high to low)</option>
                  <option value="amount_asc">💰 Amount (low to high)</option>
                  <option value="newest">🆕 Newest first</option>
                </select>
              </div>

              {/* Basic / Advanced Tabs */}
              <div className="flex gap-1 mb-5 bg-gray-100/60 rounded-xl p-1">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-all ${
                    activeTab === 'basic'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Basic
                  {activeBasicCount > 0 && (
                    <span className="ml-1 w-4 h-4 bg-primary text-white text-xs rounded-full inline-flex items-center justify-center">
                      {activeBasicCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('advanced')}
                  className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                    activeTab === 'advanced'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {!user && <Lock size={10} />}
                  Advanced
                  {activeAdvancedCount > 0 && (
                    <span className="ml-1 w-4 h-4 bg-primary text-white text-xs rounded-full inline-flex items-center justify-center">
                      {activeAdvancedCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Filter Content */}
              {activeTab === 'basic' ? (
                <>
                  <BasicFilters
                    filters={basicFilters}
                    onChange={f => { setBasicFilters(f); setPage(1) }}
                    matchCount={totalCount}
                    loading={loading}
                  />
                  {!user && (
                    <div className="mt-5 pt-4 border-t border-gray-100 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 text-center">
                      <Sparkles size={16} className="text-primary mx-auto mb-1" />
                      <p className="text-xs text-gray-600 font-medium mb-1">More precise results?</p>
                      <p className="text-xs text-gray-400 mb-2">Sign in to unlock Advanced Filters — caste, income, religion, disability, and more.</p>
                      <button
                        onClick={() => setActiveTab('advanced')}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Try Advanced Search →
                      </button>
                    </div>
                  )}
                </>
              ) : user ? (
                <AdvancedFilters
                  filters={advancedFilters}
                  basicFilters={basicFilters}
                  onChange={f => { setAdvancedFilters(f); setPage(1) }}
                />
              ) : (
                <SearchLoginPrompt />
              )}
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {error && (
              <div className="glass-card p-6 text-center text-red-500 mb-6">
                <p>{error}</p>
                <button onClick={fetchScholarships} className="btn-primary mt-4 text-sm px-4 py-2">Retry</button>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : scholarships.length === 0 ? (
              <div className="glass-card p-16 text-center">
                <GraduationCap size={56} className="text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No scholarships match your filters</h3>
                <p className="text-gray-400 mb-2 text-sm">{zeroResultSuggestion()}</p>
                <button onClick={clearAll} className="btn-primary px-6 py-2.5 mt-4">Reset All Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {scholarships.map(s => (
                    <ScholarshipCard
                      key={s.id}
                      scholarship={s}
                      isSaved={savedIds.has(s.id)}
                      showSaveButton={!!user}
                      userId={user?.id}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2.5 glass-card hover:bg-white/70 disabled:opacity-40 rounded-xl transition-all"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      const p = i + 1
                      return (
                        <button key={p} onClick={() => setPage(p)}
                          className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                            page === p ? 'bg-primary text-white shadow-sm' : 'glass-card text-gray-600 hover:bg-white/70'
                          }`}
                        >{p}</button>
                      )
                    })}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2.5 glass-card hover:bg-white/70 disabled:opacity-40 rounded-xl transition-all"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default function ScholarshipsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-10 w-64 bg-gray-200 rounded-xl animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <ScholarshipsContent />
    </Suspense>
  )
}
