export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-56 mb-2" />
      <div className="h-4 bg-gray-100 rounded-md w-72 mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 bg-white/70 rounded-2xl border border-gray-100 p-5" />
        ))}
      </div>

      <div className="h-96 bg-white/70 rounded-2xl border border-gray-100" />
    </div>
  )
}
