'use client'

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import {
  FileCheck,
  Clock,
  ShieldCheck,
  AlertTriangle,
  BarChart3,
  FileText,
  FilePenLine,
  Filter,
  Eye,
  MoreVertical,
} from 'lucide-react'
import ContractViewSheet from '@/components/ContractViewSheet'
import PDFViewerSheet from '@/components/PDFViewerSheet'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'

interface AdminStats {
  totalContracts: number
  totalDrafts: number
  totalPendingSignatures: number
  completedLast30Days: number
  verifiedDocuments: number
  suspiciousEvents: number
}

interface Contract {
  id: string
  title: string
  status: string
  category: string
  createdAt: string
  receiverName: string
  receiverEmail: string
  pdfUrl?: string | null
  initiator: {
    name: string | null
    email: string
  }
  receiver: {
    name: string | null
    email: string
  } | null
}

const STATUS_FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'DRAFT', label: 'Draft' },
  { key: 'AWAITING_SIGNATURE', label: 'Awaiting' },
  { key: 'COMPLETED', label: 'Completed' },
]

export default function AdminStatsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [contracts, setContracts] = useState<Contract[]>([])
  const [contractsLoading, setContractsLoading] = useState(false)
  const [viewingContractId, setViewingContractId] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [showPDFViewer, setShowPDFViewer] = useState(false)
  const [selectedPDFUrl, setSelectedPDFUrl] = useState<string | null>(null)
  const [selectedPDFTitle, setSelectedPDFTitle] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchContracts = useCallback(async () => {
    try {
      setContractsLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      })
      if (selectedStatus !== 'ALL') {
        params.append('status', selectedStatus)
      }
      const response = await axios.get(`/api/admin/contracts?${params}`)
      setContracts(response.data.contracts)
      setTotalCount(response.data.pagination.total)
      setTotalPages(response.data.pagination.totalPages)
    } catch (error) {
      console.error('Failed to fetch contracts:', error)
    } finally {
      setContractsLoading(false)
    }
  }, [selectedStatus, currentPage, itemsPerPage])

  useEffect(() => {
    fetchContracts()
  }, [fetchContracts])

  // Reset to page 1 when status or itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedStatus, itemsPerPage])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/admin/dashboard')
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

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-800',
      AWAITING_SIGNATURE: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
    }
    return styles[status as keyof typeof styles] || styles.DRAFT
  }

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ')
  }

  const getCategoryLabel = (category: string) => {
    const categoryLabels: Record<string, string> = {
      HOUSING: 'Housing',
      LAND: 'Land',
      CIVIL_SERVICE_COMMISSION: 'Civil Service',
      MINISTRY_OF_JUSTICE: 'Justice',
      OTHER: 'Other',
    }
    return categoryLabels[category] || category || 'Other'
  }

  const handleViewContract = (contractId: string) => {
    setViewingContractId(contractId)
    setIsSheetOpen(true)
  }

  const handleCloseView = () => {
    setViewingContractId(null)
    setIsSheetOpen(false)
    fetchStats()
    fetchContracts()
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
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" />
          Statistics
        </h1>
        <p className="text-gray-600 mt-2">System-wide contract metrics across all users</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Contracts */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contracts</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalContracts}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">All contracts</p>
          </div>

          {/* Draft Contracts */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Draft Contracts</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalDrafts}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <FilePenLine className="w-8 h-8 text-gray-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Not yet sent</p>
          </div>

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

      {/* Contracts Listing */}
      <div className="mt-8">
        <div className="flex justify-between items-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Activities</h2>
            <p className="text-gray-600 mt-1">View and manage all contracts across the system</p>
          </div>

          {/* Status Filter */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedStatus(filter.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedStatus === filter.key
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contracts Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedStatus === 'ALL'
                    ? 'All Contracts'
                    : STATUS_FILTERS.find((f) => f.key === selectedStatus)?.label}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {totalCount} {totalCount === 1 ? 'contract' : 'contracts'} found
                </p>
              </div>
            </div>
          </div>

          {contractsLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading contracts...</p>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            {contracts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts found</h3>
                <p className="text-gray-600">
                  {selectedStatus === 'ALL'
                    ? 'No contracts available in the system.'
                    : `No contracts with status: ${getStatusLabel(selectedStatus)}`}
                </p>
              </div>
            ) : (
              <>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contract Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Initiator
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receiver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contracts.map((contract) => (
                      <tr key={contract.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{contract.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {getCategoryLabel(contract.category)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {contract.initiator.name || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500">{contract.initiator.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {contract.receiver?.name || contract.receiverName || 'Not assigned'}
                          </div>
                          {(contract.receiver?.email || contract.receiverEmail) && (
                            <div className="text-xs text-gray-500">
                              {contract.receiver?.email || contract.receiverEmail}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                              contract.status
                            )}`}
                          >
                            {getStatusLabel(contract.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(contract.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <DropdownMenu
                              trigger={
                                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                                  <MoreVertical className="w-5 h-5" />
                                </button>
                              }
                            >
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleViewContract(contract.id)
                                }}
                                icon={<Eye className="w-4 h-4" />}
                              >
                                View Contract
                              </DropdownMenuItem>
                              {contract.pdfUrl && contract.status === 'COMPLETED' && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedPDFUrl(contract.pdfUrl!)
                                    setSelectedPDFTitle(contract.title)
                                    setShowPDFViewer(true)
                                  }}
                                  icon={<FileText className="w-4 h-4" />}
                                >
                                  View PDF Contract
                                </DropdownMenuItem>
                              )}
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalCount > 0 && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Items per page:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                        <option value={40}>40</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-sm text-gray-600 ml-4">
                        Showing {(currentPage - 1) * itemsPerPage + 1}-
                        {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contract View Sheet */}
      <ContractViewSheet
        isOpen={isSheetOpen}
        onClose={handleCloseView}
        contractId={viewingContractId}
        onUpdate={fetchContracts}
      />

      {/* PDF Viewer Sheet */}
      {selectedPDFUrl && (
        <PDFViewerSheet
          isOpen={showPDFViewer}
          onClose={() => {
            setShowPDFViewer(false)
            setSelectedPDFUrl(null)
            setSelectedPDFTitle('')
          }}
          pdfUrl={selectedPDFUrl}
          contractTitle={selectedPDFTitle}
        />
      )}
    </div>
  )
}
