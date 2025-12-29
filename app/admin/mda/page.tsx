'use client'

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import {
  Building2,
  Home,
  MapPin,
  Users,
  Scale,
  Eye,
  FileText,
  MoreVertical,
  Clock,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import ContractViewSheet from '@/components/ContractViewSheet'
import PDFViewerSheet from '@/components/PDFViewerSheet'

interface Contract {
  id: string
  title: string
  status: string
  category: string
  createdAt: string
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

interface MDAData {
  contracts: Contract[]
  counts: Record<string, number>
}

const MDA_CATEGORIES = [
  { key: 'ALL', label: 'All MDAs' },
  { key: 'HOUSING', label: 'Housing' },
  { key: 'LAND', label: 'Land' },
  { key: 'CIVIL_SERVICE_COMMISSION', label: 'Civil Service Commission' },
  { key: 'MINISTRY_OF_JUSTICE', label: 'Ministry of Justice' },
]

const DATE_FILTERS = [
  { key: '7', label: 'Last 7 Days' },
  { key: '30', label: 'Last 30 Days' },
  { key: '365', label: 'Last Year' },
  { key: 'all', label: 'All Data' },
]

export default function MDADashboard() {
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedDateFilter, setSelectedDateFilter] = useState('all')
  const [data, setData] = useState<MDAData | null>(null)
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

  const fetchContracts = useCallback(async () => {
    try {
      setFetchingData(true)

      const response = await axios.get('/api/mda/contracts', {
        params: {
          category: selectedCategory,
          dateFilter: selectedDateFilter,
          page: currentPage,
          limit: itemsPerPage,
        },
      })
      setData(response.data)
      setTotalCount(response.data.pagination.total)
      setTotalPages(response.data.pagination.totalPages)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch MDA contracts:', error)
      setLoading(false)
    } finally {
      setFetchingData(false)
    }
  }, [selectedCategory, selectedDateFilter, currentPage, itemsPerPage])

  useEffect(() => {
    fetchContracts()
  }, [fetchContracts])

  // Reset to page 1 when category, date filter, or itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, selectedDateFilter, itemsPerPage])

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
    setIsSheetOpen(false)
    setViewingContractId(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Dropdowns */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-primary" />
              MDA Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Ministries, Departments & Agencies Contract Management
            </p>
          </div>
          <div className="flex gap-3">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              {MDA_CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Date Filter Dropdown */}
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              {DATE_FILTERS.map((filter) => (
                <option key={filter.key} value={filter.key}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Static Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Contracts - Real Data */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Contracts</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalCount}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            {selectedCategory === 'ALL'
              ? 'All categories'
              : MDA_CATEGORIES.find((c) => c.key === selectedCategory)?.label}
          </p>
        </div>

        {/* Average Time to Sign - Static */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 opacity-60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Time to Sign</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">4.2 days</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">Coming soon</p>
        </div>

        {/* Verification Success Rate - Static */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 opacity-60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verification Success</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">97.8%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <ShieldCheck className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">Coming soon</p>
        </div>

        {/* Flagged/Suspicious - Static */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500 opacity-60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Flagged/Suspicious</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">3</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">Coming soon</p>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedCategory === 'ALL'
                  ? 'All MDA Contracts'
                  : MDA_CATEGORIES.find((c) => c.key === selectedCategory)?.label}
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

        {data && data.contracts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{contract.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">
                        {getCategoryLabel(contract.category)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {contract.initiator.name || 'N/A'}
                        </div>
                        <div className="text-gray-500">{contract.initiator.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {contract.receiver?.name || 'N/A'}
                        </div>
                        <div className="text-gray-500">{contract.receiver?.email || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                          contract.status
                        )}`}
                      >
                        {getStatusLabel(contract.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(contract.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <DropdownMenu
                        trigger={
                          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        }
                      >
                        <DropdownMenuItem
                          onClick={() => handleViewContract(contract.id)}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalCount > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
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
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No contracts found in this category</p>
          </div>
        )}
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
