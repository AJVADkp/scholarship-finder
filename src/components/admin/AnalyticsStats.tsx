import { Globe, Monitor, Users, MapPin, Compass, TrendingUp } from 'lucide-react'

export type AnalyticsItem = { label: string; count: number }

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  color: string
}) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export function BarList({
  title,
  icon: Icon,
  items,
  color,
}: {
  title: string
  icon: React.ElementType
  items: AnalyticsItem[]
  color: string
}) {
  const max = items[0]?.count || 1
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} style={{ color }} />
        <h3 className="text-sm font-bold text-gray-700">{title}</h3>
      </div>
      <div className="space-y-2.5">
        {items.slice(0, 8).map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600 font-medium truncate max-w-48">{item.label}</span>
              <span className="text-gray-400 font-bold">{item.count}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(item.count / max) * 100}%`, background: color }}
              />
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-gray-400 py-2">No data recorded</p>}
      </div>
    </div>
  )
}

interface AnalyticsStatsOverviewProps {
  totalVisits: number
  uniqueUsers: number
  topPages: AnalyticsItem[]
  topCountries: AnalyticsItem[]
  topDevices: AnalyticsItem[]
  topBrowsers: AnalyticsItem[]
}

export function AnalyticsStatsOverview({
  totalVisits,
  uniqueUsers,
  topPages,
  topCountries,
  topDevices,
  topBrowsers,
}: AnalyticsStatsOverviewProps) {
  return (
    <>
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={TrendingUp} label="Total Page Views" value={totalVisits} color="#4F8EF7" />
        <StatCard
          icon={Users}
          label="Unique Users"
          value={uniqueUsers}
          sub="Unique IP + User combinations"
          color="#34C48B"
        />
        <StatCard
          icon={Globe}
          label="Top Country"
          value={topCountries[0]?.label || '—'}
          sub={topCountries[0] ? `${topCountries[0].count} visits` : undefined}
          color="#F59E0B"
        />
        <StatCard
          icon={Compass}
          label="Top Page"
          value={topPages[0]?.label || '—'}
          sub={topPages[0] ? `${topPages[0].count} views` : undefined}
          color="#8B5CF6"
        />
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <BarList title="Top Pages" icon={Compass} items={topPages} color="#4F8EF7" />
        <BarList title="Top Countries" icon={Globe} items={topCountries} color="#34C48B" />
        <BarList title="Devices" icon={Monitor} items={topDevices} color="#F59E0B" />
        <BarList title="Browsers" icon={MapPin} items={topBrowsers} color="#8B5CF6" />
      </div>
    </>
  )
}
