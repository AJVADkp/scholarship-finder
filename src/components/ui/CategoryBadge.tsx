'use client'

import { type Category, CATEGORY_CONFIG } from '@/lib/types'

interface BadgeProps {
  category: Category | string | null
  size?: 'sm' | 'md'
}

export function CategoryBadge({ category, size = 'md' }: BadgeProps) {
  if (!category) return null

  const config = CATEGORY_CONFIG[category as Category]
  const slug = category.toLowerCase().replace(/\s+/g, '-').replace('-', '-')

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-3 py-1'

  return (
    <span className={`category-pill category-${slug} font-semibold ${sizeClass}`}>
      {config?.emoji || '📚'} {category}
    </span>
  )
}
