'use client'

interface StatsCardProps {
  title: string
  value: number
  change?: string
  subtitle?: string
  variant: 'warning' | 'success' | 'info' | 'danger'
}

export default function StatsCard({ title, value, change, subtitle, variant }: StatsCardProps) {
  const variants = {
    warning: {
      badge: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      icon: '⚠️',
    },
    success: {
      badge: 'bg-green-50 text-green-800 border-green-200',
      icon: '✅',
    },
    info: {
      badge: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: '✓',
    },
    danger: {
      badge: 'bg-red-50 text-red-800 border-red-200',
      icon: '🚨',
    },
  }

  const style = variants[variant]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${style.badge}`}>
          {variant === 'warning'
            ? 'Overview'
            : variant === 'success'
            ? 'Overview'
            : variant === 'info'
            ? 'Overview'
            : 'Overview'}
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && <p className="text-sm text-gray-600 mt-1">{change}</p>}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}
