export function SkeletonCard() {
  return (
    <div className="glass-card p-6 h-64 overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-5 w-24 rounded-full" />
      </div>
      <div className="skeleton h-6 w-3/4 mb-2 rounded-lg" />
      <div className="skeleton h-4 w-1/2 mb-4 rounded-lg" />
      <div className="skeleton h-4 w-full mb-2 rounded-lg" />
      <div className="skeleton h-4 w-5/6 mb-6 rounded-lg" />
      <div className="flex justify-between items-center mt-auto">
        <div className="skeleton h-8 w-24 rounded-lg" />
        <div className="skeleton h-9 w-28 rounded-full" />
      </div>
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div className="stat-card">
      <div className="skeleton h-8 w-8 rounded-full mx-auto mb-3" />
      <div className="skeleton h-8 w-20 rounded-lg mx-auto mb-2" />
      <div className="skeleton h-4 w-24 rounded-lg mx-auto" />
    </div>
  )
}
