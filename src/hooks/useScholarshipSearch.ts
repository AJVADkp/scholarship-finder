'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { type Scholarship } from '@/lib/types'
import { EMPTY_BASIC_FILTERS, type BasicFilterState } from '@/components/search/BasicFilters'
import {
  EMPTY_ADVANCED_FILTERS,
  type AdvancedFilterState,
} from '@/components/search/AdvancedFilters'
import type { User } from '@supabase/supabase-js'

export const ITEMS_PER_PAGE = 12

export function countActiveBasicFilters(f: BasicFilterState) {
  return (
    (f.academicLevel ? 1 : 0) +
    (f.stream ? 1 : 0) +
    (f.gender ? 1 : 0) +
    (f.state ? 1 : 0) +
    (f.incomeRange ? 1 : 0) +
    f.scholarshipTypes.length
  )
}

export function countActiveAdvancedFilters(f: AdvancedFilterState) {
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
    (f.courseSpecialization ? 1 : 0) +
    (f.studyMode ? 1 : 0) +
    (f.geographicFocus ? 1 : 0) +
    (f.institutionType ? 1 : 0) +
    (f.yearOfStudy ? 1 : 0) +
    (f.minCollegePerformance ? 1 : 0) +
    (f.applicationType ? 1 : 0)
  )
}

export function useScholarshipSearch() {
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
  const [advancedFilters, setAdvancedFilters] =
    useState<AdvancedFilterState>(EMPTY_ADVANCED_FILTERS)
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'deadline' | 'amount_desc' | 'amount_asc' | 'newest'>(
    'deadline'
  )

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase
          .from('saved_scholarships')
          .select('scholarship_id')
          .eq('user_id', user.id)
          .then(({ data }) => {
            if (data) setSavedIds(new Set(data.map((d) => d.scholarship_id)))
          })
      }
    })
  }, [])

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setSearchQuery(q)
      setDebouncedQuery(q)
    }
    const sort = searchParams.get('sort') as typeof sortBy
    if (sort) setSortBy(sort)
  }, [])

  useEffect(() => {
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(searchQuery)
      setPage(1)
    }, 300)
    return () => clearTimeout(debounceTimer.current)
  }, [searchQuery])

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([])
      return
    }
    supabase
      .from('scholarships')
      .select('title')
      .ilike('title', `%${searchQuery}%`)
      .limit(5)
      .then(({ data }) => setSuggestions(data?.map((d) => d.title) || []))
  }, [searchQuery])

  const fetchScholarships = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('scholarships')
        .select('*', { count: 'exact' })
        .eq('is_active', true)

      if (debouncedQuery) {
        query = query.or(
          `title.ilike.%${debouncedQuery}%,provider.ilike.%${debouncedQuery}%,description.ilike.%${debouncedQuery}%`
        )
      }

      if (basicFilters.academicLevel) {
        query = query.contains('academic_levels', [basicFilters.academicLevel])
      }
      if (basicFilters.stream) {
        query = query.contains('streams', [basicFilters.stream])
      }
      if (basicFilters.gender) {
        query = query.eq('gender_eligibility', basicFilters.gender)
      }
      if (basicFilters.state) {
        query = query.or(`state.eq.${basicFilters.state},state.eq.All India,state.is.null`)
      }
      if (basicFilters.incomeRange) {
        query = query.eq('income_range', basicFilters.incomeRange)
      }
      if (basicFilters.scholarshipTypes.length > 0) {
        query = query.in('scholarship_type', basicFilters.scholarshipTypes)
      }

      if (user && activeTab === 'advanced') {
        if (advancedFilters.casteCategory) {
          query = query.contains('caste_categories', [advancedFilters.casteCategory])
        }
        if (advancedFilters.religion) {
          query = query.eq('religion', advancedFilters.religion)
        }
        if (advancedFilters.disabilityStatus) {
          query = query.eq('disability_required', true)
        }
        if (advancedFilters.girlsOnly) {
          query = query.eq('girls_only', true)
        }
        if (advancedFilters.specialBackgrounds.length > 0) {
          query = query.contains('special_backgrounds', advancedFilters.specialBackgrounds)
        }
      }

      switch (sortBy) {
        case 'deadline':
          query = query.order('deadline', { ascending: true, nullsFirst: false })
          break
        case 'amount_desc':
          query = query.order('amount', { ascending: false, nullsFirst: false })
          break
        case 'amount_asc':
          query = query.order('amount', { ascending: true, nullsFirst: false })
          break
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
      }

      const from = (page - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      query = query.range(from, to)

      const { data, count, error: fetchErr } = await query

      if (fetchErr) throw fetchErr

      setScholarships(data || [])
      setTotalCount(count || 0)
    } catch {
      setError('Failed to load scholarships. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [debouncedQuery, basicFilters, advancedFilters, activeTab, user, sortBy, page])

  useEffect(() => {
    fetchScholarships()
  }, [fetchScholarships])

  const clearAll = () => {
    setSearchQuery('')
    setDebouncedQuery('')
    setBasicFilters(EMPTY_BASIC_FILTERS)
    setAdvancedFilters(EMPTY_ADVANCED_FILTERS)
    setSortBy('deadline')
    setPage(1)
  }

  return {
    user,
    savedIds,
    setSavedIds,
    scholarships,
    loading,
    error,
    totalCount,
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    basicFilters,
    setBasicFilters,
    advancedFilters,
    setAdvancedFilters,
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    sortBy,
    setSortBy,
    clearAll,
  }
}
