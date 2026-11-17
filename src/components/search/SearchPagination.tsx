'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SearchPaginationProps {
  page: number
  totalPages: number
  totalCount: number
  itemsPerPage: number
  setPage: (p: number | ((prev: number) => number)) => void
}

export function SearchPagination({
  page,
  totalPages,
  totalCount,
  itemsPerPage,
  setPage,
}: SearchPaginationProps) {
  if (totalPages <= 1) return null

  const from = (page - 1) * itemsPerPage + 1
  const to = Math.min(page * itemsPerPage, totalCount)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-6 border-t border-gray-100">
      <p className="text-sm text-gray-500">
        Showing{' '}
        <span className="font-semibold text-gray-700">
          {from}–{to}
        </span>{' '}
        of <span className="font-semibold text-gray-700">{totalCount}</span> scholarships
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="btn-ghost p-2 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce<(number | string)[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...')
              acc.push(p)
              return acc
            }, [])
            .map((item, idx) =>
              typeof item === 'string' ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm">
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => setPage(item)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                    page === item
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item}
                </button>
              )
            )}
        </div>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="btn-ghost p-2 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
