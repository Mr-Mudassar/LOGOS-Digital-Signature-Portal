'use client'

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { FileText, Filter, Eye, Download, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ContractViewSheet from '@/components/ContractViewSheet'
import PDFViewerSheet from '@/components/PDFViewerSheet'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'

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
  { key: 'ALL', label: 'All Contracts' },
  { key: 'DRAFT', label: 'Draft' },
  { key: 'AWAITING_SIGNATURE', label: 'Awaiting Signature' },
  { key: 'COMPLETED', label: 'Completed' },
]

export default function AdminAllContractsPage() {
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchingData, setFetchingData] = useState(false)
  const [viewingContractId, setViewingContractId] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [showPDFViewer, setShowPDFViewer] = useState(false)
  const [selectedPDFUrl, setSelectedPDFUrl] = useState<string | null>(null)
  const [selectedPDFTitle, setSelectedPDFTitle] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    draft: 0,
    awaiting: 0,
    completed: 0,
  })

  const fetchStatusCounts = useCallback(async () => {
    try {
      // Fetch counts for all statuses
      const [allRes, draftRes, awaitingRes, completedRes] = await Promise.all([
        axios.get('/api/admin/contracts?page=1&limit=1'),
        axios.get('/api/admin/contracts?page=1&limit=1&status=DRAFT'),
        axios.get('/api/admin/contracts?page=1&limit=1&status=AWAITING_SIGNATURE'),
        axios.get('/api/admin/contracts?page=1&limit=1&status=COMPLETED'),
      ])

      setStatusCounts({
        all: allRes.data.pagination.total,
        draft: draftRes.data.pagination.total,
        awaiting: awaitingRes.data.pagination.total,
        completed: completedRes.data.pagination.total,
      })
    } catch (error) {
      console.error('Failed to fetch status counts:', error)
    }
  }, [])

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true)

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

      // Update the specific count for current filter
      if (selectedStatus === 'ALL') {
        setStatusCounts((prev) => ({ ...prev, all: response.data.pagination.total }))
      } else if (selectedStatus === 'DRAFT') {
        setStatusCounts((prev) => ({ ...prev, draft: response.data.pagination.total }))
      } else if (selectedStatus === 'AWAITING_SIGNATURE') {
        setStatusCounts((prev) => ({ ...prev, awaiting: response.data.pagination.total }))
      } else if (selectedStatus === 'COMPLETED') {
        setStatusCounts((prev) => ({ ...prev, completed: response.data.pagination.total }))
      }
    } catch (error) {
      console.error('Failed to fetch contracts:', error)
    } finally {
      setLoading(false)
      setFetchingData(false)
    }
  }, [selectedStatus, currentPage, itemsPerPage])

  // Fetch status counts on mount
  useEffect(() => {
    fetchStatusCounts()
  }, [fetchStatusCounts])

  useEffect(() => {
    fetchContracts()
  }, [fetchContracts])

  // Reset to page 1 when status or itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedStatus, itemsPerPage])

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
    // Refresh counts in case contract status changed
    fetchStatusCounts()
    fetchContracts()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          All Contracts
        </h1>
        <p className="text-gray-600 mt-2">View and manage all contracts across the system</p>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
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

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Draft</p>
          <p className="text-2xl font-bold text-gray-900">{statusCounts.draft}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{statusCounts.awaiting}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">{statusCounts.completed}</p>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedStatus === 'ALL'
                  ? 'All Contracts'
                  : STATUS_FILTERS.find((f) => f.key === selectedStatus)?.label}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {totalCount} {totalCount === 1 ? 'contract' : 'contracts'} found
              </p>
            </div>
          </div>
        </div>

        {(loading || fetchingData) && (
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
                        <div className="flex items-center gap-2">
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
