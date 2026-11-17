'use client'

import { Suspense } from 'react'
import { ScholarshipCard } from '@/components/scholarship/ScholarshipCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { Footer } from '@/components/layout/Footer'
import { Search, X, SlidersHorizontal, GraduationCap } from 'lucide-react'
import {
  useScholarshipSearch,
  countActiveBasicFilters,
  countActiveAdvancedFilters,
  ITEMS_PER_PAGE,
} from '@/hooks/useScholarshipSearch'
import { SearchSidebar } from '@/components/search/SearchSidebar'
import { SearchPagination } from '@/components/search/SearchPagination'

function ScholarshipsContent() {
  const {
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
  } = useScholarshipSearch()

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
  const activeBasicCount = countActiveBasicFilters(basicFilters)
  const activeAdvancedCount = user ? countActiveAdvancedFilters(advancedFilters) : 0
  const totalActiveFilters = activeBasicCount + activeAdvancedCount
  const hasFilters = totalActiveFilters > 0 || debouncedQuery

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Browse Scholarships</h1>
          <p className="text-gray-500 text-sm">
            {loading
              ? 'Searching...'
              : `${totalCount} scholarship${totalCount !== 1 ? 's' : ''} found`}
            {hasFilters && !loading && (
              <button
                onClick={clearAll}
                className="ml-3 text-primary hover:underline font-semibold text-xs"
              >
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
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSuggestions(true)
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onFocus={() => setShowSuggestions(true)}
              className="bg-transparent outline-none text-base text-gray-700 placeholder-gray-400 w-full font-medium"
              id="scholarship-search"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-gray-300 hover:text-gray-500"
              >
                <X size={18} />
              </button>
            )}
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 glass-card p-2 z-20 animate-scale-in shadow-xl">
              {suggestions.map((s) => (
                <button
                  key={s}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl flex items-center gap-3"
                  onClick={() => {
                    setSearchQuery(s)
                    setShowSuggestions(false)
                  }}
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
          <SearchSidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            totalActiveFilters={totalActiveFilters}
            hasFilters={Boolean(hasFilters)}
            clearAll={clearAll}
            sortBy={sortBy}
            setSortBy={setSortBy}
            setPage={setPage}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={user}
            basicFilters={basicFilters}
            setBasicFilters={setBasicFilters}
            advancedFilters={advancedFilters}
            setAdvancedFilters={setAdvancedFilters}
            totalCount={totalCount}
            loading={loading}
          />

          {/* Main Listings */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="glass-card p-12 text-center text-gray-500">
                <p className="font-semibold mb-2">{error}</p>
                <button onClick={clearAll} className="btn-primary mt-4">
                  Reset Search
                </button>
              </div>
            ) : scholarships.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 text-2xl">
                  <GraduationCap size={32} className="text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">No scholarships found</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                  We couldn&apos;t find any scholarships matching your active criteria. Try
                  broadening your filters.
                </p>
                <button onClick={clearAll} className="btn-primary">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {scholarships.map((s) => (
                    <ScholarshipCard
                      key={s.id}
                      scholarship={s}
                      isSaved={savedIds.has(s.id)}
                      userId={user?.id}
                      onSaveToggle={(id, saved) => {
                        setSavedIds((prev) => {
                          const next = new Set(prev)
                          if (saved) next.add(id)
                          else next.delete(id)
                          return next
                        })
                      }}
                    />
                  ))}
                </div>

                <SearchPagination
                  page={page}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  itemsPerPage={ITEMS_PER_PAGE}
                  setPage={setPage}
                />
              </>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default function ScholarshipsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <ScholarshipsContent />
    </Suspense>
  )
}
