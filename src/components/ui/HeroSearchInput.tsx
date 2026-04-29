'use client'

export function HeroSearchInput() {
  return (
    <input
      type="text"
      placeholder="Search scholarships, providers, or tags..."
      className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full font-medium"
      id="hero-search-input"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          const val = (e.target as HTMLInputElement).value
          window.location.href = `/scholarships?q=${encodeURIComponent(val)}`
        }
      }}
    />
  )
}
