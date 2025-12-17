'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { FileCheck, Clock, ShieldCheck, AlertTriangle } from 'lucide-react'

interface AdminStats {
  totalPendingSignatures: number
  completedLast30Days: number
  verifiedDocuments: number
  suspiciousEvents: number
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/admin/stats')
      setStats(response.data)
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Access denied. Admin privileges required.')
      } else {
        setError('Failed to load statistics')
      }
      console.error('Failed to fetch admin stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
        <p className="text-gray-600 mt-2">System-wide contract metrics across all users</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Pending Signatures */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Signatures</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalPendingSignatures}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Across all users</p>
          </div>

          {/* Completed Last 30 Days */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Contracts</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedLast30Days}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FileCheck className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Last 30 days</p>
          </div>

          {/* Verified Documents (Static) */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 opacity-60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified Documents</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.verifiedDocuments}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Coming soon</p>
          </div>

          {/* Suspicious Events (Static) */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500 opacity-60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspicious Events</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.suspiciousEvents}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Coming soon</p>
          </div>
        </div>
      )}
    </div>
  )
}
