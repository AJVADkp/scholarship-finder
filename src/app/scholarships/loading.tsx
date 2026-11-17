export default function ScholarshipsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Title skeleton */}
      <div className="h-8 bg-gray-200 rounded-lg w-64 mb-3" />
      <div className="h-4 bg-gray-100 rounded-md w-96 mb-8" />

      {/* Filter panel skeleton */}
      <div className="h-16 bg-white/70 border border-gray-100 rounded-2xl mb-8" />

      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 bg-white/80 rounded-2xl border border-gray-100 p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-6 bg-gray-100 rounded-full w-24" />
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
            <div className="h-10 bg-gray-100 rounded-xl w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
