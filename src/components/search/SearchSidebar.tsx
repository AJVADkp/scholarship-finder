'use client'

import { SlidersHorizontal, X } from 'lucide-react'
import { BasicFilters, type BasicFilterState } from './BasicFilters'
import { AdvancedFilters, type AdvancedFilterState } from './AdvancedFilters'
import { SearchLoginPrompt } from './SearchLoginPrompt'
import type { User } from '@supabase/supabase-js'

interface SearchSidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
  totalActiveFilters: number
  hasFilters: boolean
  clearAll: () => void
  sortBy: 'deadline' | 'amount_desc' | 'amount_asc' | 'newest'
  setSortBy: (v: 'deadline' | 'amount_desc' | 'amount_asc' | 'newest') => void
  setPage: (p: number) => void
  activeTab: 'basic' | 'advanced'
  setActiveTab: (t: 'basic' | 'advanced') => void
  user: User | null
  basicFilters: BasicFilterState
  setBasicFilters: React.Dispatch<React.SetStateAction<BasicFilterState>>
  advancedFilters: AdvancedFilterState
  setAdvancedFilters: React.Dispatch<React.SetStateAction<AdvancedFilterState>>
  totalCount: number
  loading: boolean
}

export function SearchSidebar({
  sidebarOpen,
  setSidebarOpen,
  totalActiveFilters,
  hasFilters,
  clearAll,
  sortBy,
  setSortBy,
  setPage,
  activeTab,
  setActiveTab,
  user,
  basicFilters,
  setBasicFilters,
  advancedFilters,
  setAdvancedFilters,
  totalCount,
  loading,
}: SearchSidebarProps) {
  return (
    <aside
      className={`${
        sidebarOpen
          ? 'fixed inset-0 z-50 p-4 overflow-y-auto bg-white/90 backdrop-blur-sm'
          : 'hidden'
      } lg:block lg:static lg:z-auto lg:p-0 lg:overflow-visible lg:bg-transparent lg:backdrop-blur-none`}
    >
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
            onChange={e => {
              setSortBy(e.target.value as typeof sortBy)
              setPage(1)
            }}
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
              activeTab === 'basic' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Basic
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'advanced' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Advanced
            {!user && <span className="text-[10px]">🔒</span>}
          </button>
        </div>

        {activeTab === 'basic' ? (
          <BasicFilters
            filters={basicFilters}
            onChange={f => {
              setBasicFilters(f)
              setPage(1)
            }}
            matchCount={totalCount}
            loading={loading}
          />
        ) : user ? (
          <AdvancedFilters
            filters={advancedFilters}
            basicFilters={basicFilters}
            onChange={f => {
              setAdvancedFilters(f)
              setPage(1)
            }}
          />
        ) : (
          <SearchLoginPrompt />
        )}
      </div>
    </aside>
  )
}
