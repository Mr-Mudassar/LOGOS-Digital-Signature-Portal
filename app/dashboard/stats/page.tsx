'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Shield, BarChart3 } from 'lucide-react'
import axios from 'axios'
import Sidebar from '@/components/dashboard/Sidebar'
import StatsCard from '@/components/dashboard/StatsCard'

export default function StatsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      // Redirect admin to their stats page
      router.push('/admin/stats')
    }
  }, [status, router, session])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchContracts()
    }
  }, [status])

  const fetchContracts = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/contracts')
      setContracts(response.data.contracts)
    } catch (error) {
      console.error('Error fetching contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-lg mb-4 animate-pulse">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const stats = {
    drafts: contracts.filter((c) => c.status === 'DRAFT').length,
    pending: contracts.filter((c) => c.status === 'AWAITING_SIGNATURE').length,
    completed: contracts.filter((c) => c.status === 'COMPLETED').length,
    total: contracts.length,
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-primary" />
                My Statistics
              </h1>
              <p className="text-gray-600 mt-1">Your personal contract statistics and metrics</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading statistics...</p>
            </div>
          ) : (
            /* Stats Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard title="DRAFTS" value={stats.drafts} variant="warning" />
              <StatsCard title="PENDING SIGNATURE" value={stats.pending} variant="info" />
              <StatsCard title="COMPLETED" value={stats.completed} variant="success" />
              <StatsCard
                title="TOTAL CONTRACTS"
                value={stats.total}
                subtitle="All time"
                variant="info"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
