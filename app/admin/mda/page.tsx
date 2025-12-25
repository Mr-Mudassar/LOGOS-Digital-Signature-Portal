'use client'

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { Building2, Home, MapPin, Users, Scale, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface Contract {
  id: string
  title: string
  status: string
  category: string
  createdAt: string
  initiator: {
    name: string | null
    email: string
  }
  receiver: {
    name: string | null
    email: string
  } | null
}

interface ContractDetails extends Contract {
  aiGeneratedContent: string | null
  initiatorName: string
  receiverName: string
  signatures: Array<{
    type: string
    signedAt: string
    user: {
      name: string | null
      email: string
    }
  }>
}

interface MDAData {
  contracts: Contract[]
  counts: Record<string, number>
}

const MDA_CATEGORIES = [
  { key: 'ALL', label: 'All MDAs', icon: Building2, color: 'blue' },
  { key: 'HOUSING', label: 'Housing', icon: Home, color: 'green' },
  { key: 'LAND', label: 'Land', icon: MapPin, color: 'yellow' },
  {
    key: 'CIVIL_SERVICE_COMMISSION',
    label: 'Civil Service Commission',
    icon: Users,
    color: 'purple',
  },
  { key: 'MINISTRY_OF_JUSTICE', label: 'Ministry of Justice', icon: Scale, color: 'red' },
]

export default function MDADashboard() {
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [data, setData] = useState<MDAData | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchingData, setFetchingData] = useState(false)
  const [viewingContractId, setViewingContractId] = useState<string | null>(null)
  const [viewingContract, setViewingContract] = useState<ContractDetails | null>(null)
  const [loadingContract, setLoadingContract] = useState(false)
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
  }, [selectedCategory, currentPage, itemsPerPage])

  useEffect(() => {
    fetchContracts()
  }, [fetchContracts])

  // Reset to page 1 when category or itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, itemsPerPage])

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

  const handleViewContract = async (contractId: string) => {
    setViewingContractId(contractId)
    setLoadingContract(true)
    try {
      const response = await axios.get(`/api/contracts/${contractId}`)
      setViewingContract(response.data.contract)
    } catch (error) {
      console.error('Failed to fetch contract details:', error)
    } finally {
      setLoadingContract(false)
    }
  }

  const handleCloseView = () => {
    setViewingContractId(null)
    setViewingContract(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-primary" />
          MDA Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Ministries, Departments & Agencies Contract Management</p>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {MDA_CATEGORIES.map((category) => {
          const Icon = category.icon
          const count =
            category.key === 'ALL'
              ? Object.values(data?.counts || {}).reduce((sum, c) => sum + c, 0)
              : data?.counts[category.key] || 0
          const isActive = selectedCategory === category.key

          return (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`p-4 rounded-lg border-2 transition-all ${
                isActive
                  ? `border-${category.color}-500 bg-${category.color}-50`
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <Icon
                  className={`w-8 h-8 mb-2 ${
                    isActive ? `text-${category.color}-600` : 'text-gray-600'
                  }`}
                />
                <p
                  className={`text-sm font-medium ${
                    isActive ? `text-${category.color}-900` : 'text-gray-900'
                  }`}
                >
                  {category.label}
                </p>
                <p
                  className={`text-2xl font-bold mt-1 ${
                    isActive ? `text-${category.color}-600` : 'text-gray-600'
                  }`}
                >
                  {count}
                </p>
              </div>
            </button>
          )
        })}
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
                    First Party
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Second Party
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
                      <div className="text-sm text-gray-900">
                        {contract.initiator.name || contract.initiator.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {contract.receiver?.name || contract.receiver?.email || 'N/A'}
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewContract(contract.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
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

      {/* View Contract Sheet */}
      <Sheet open={viewingContractId !== null} onOpenChange={handleCloseView}>
        <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl">{viewingContract?.title || 'Loading...'}</SheetTitle>
            <SheetDescription>
              {viewingContract && (
                <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100">
                  {viewingContract.status.replace(/_/g, ' ').toLowerCase()}
                </span>
              )}
            </SheetDescription>
          </SheetHeader>

          {loadingContract ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : viewingContract ? (
            <div className="mt-6 space-y-6">
              {/* Contract Parties */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Contract Parties</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">First Party (Initiator)</p>
                    <p className="font-medium">{viewingContract.initiatorName}</p>
                    <p className="text-sm text-gray-500">{viewingContract.initiator.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Second Party</p>
                    <p className="font-medium">{viewingContract.receiverName}</p>
                    <p className="text-sm text-gray-500">
                      {viewingContract.receiver?.email || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contract Content */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Contract Content</h3>
                <div
                  className="prose max-w-none border rounded-lg p-6 bg-white"
                  dangerouslySetInnerHTML={{
                    __html: viewingContract.aiGeneratedContent || '<p>No content available</p>',
                  }}
                />
              </div>

              {/* Signatures */}
              {viewingContract.signatures.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Signatures</h3>
                  <div className="space-y-3">
                    {viewingContract.signatures.map((signature, index) => (
                      <div
                        key={index}
                        className="bg-green-50 border border-green-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-green-900">
                              {signature.user.name || signature.user.email}
                            </p>
                            <p className="text-sm text-green-700">
                              {signature.type === 'INITIATOR' ? 'First Party' : 'Second Party'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-green-600">
                              Signed on {new Date(signature.signedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Contract Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Category</p>
                    <p className="font-medium">{viewingContract.category.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="font-medium">
                      {new Date(viewingContract.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}
