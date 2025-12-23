'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Shield, Plus, FileText, Clock } from 'lucide-react'
import axios from 'axios'
import Sidebar from '@/components/dashboard/Sidebar'
import ContractCard from '@/components/dashboard/ContractCard'
import CreateContractModal from '@/components/dashboard/CreateContractModal'
import ContractViewSheet from '@/components/ContractViewSheet'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const isAdmin = session?.user?.role === 'ADMIN'

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (status === 'authenticated') {
      fetchContracts()
    }
  }, [status, filter, currentPage, itemsPerPage])

  const fetchContracts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      })
      if (filter !== 'all') {
        params.append('status', filter)
      }
      const response = await axios.get(`/api/contracts?${params}`)
      setContracts(response.data.contracts)
      setTotalCount(response.data.pagination.total)
      setTotalPages(response.data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContractCreated = (contractId: string) => {
    setIsModalOpen(false)
    setSelectedContractId(contractId)
    setIsSheetOpen(true)
    fetchContracts()
  }

  const handleOpenContract = (contractId: string) => {
    setSelectedContractId(contractId)
    setIsSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setIsSheetOpen(false)
    setSelectedContractId(null)
  }

  // Reset to page 1 when filter or itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filter, itemsPerPage])

  if (status === 'loading') {
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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                My Contracts
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your contracts, signatures, and pending documents.
              </p>
            </div>
            {!isAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Contract
              </button>
            )}
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold">Recent Activities</h2>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('DRAFT')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'DRAFT'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Drafts
                </button>
                <button
                  onClick={() => setFilter('AWAITING_SIGNATURE')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'AWAITING_SIGNATURE'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Awaiting Signature
                </button>
                <button
                  onClick={() => setFilter('COMPLETED')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'COMPLETED'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading contracts...</p>
                </div>
              ) : contracts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No contracts found</p>
                  <button onClick={() => setIsModalOpen(true)} className="btn-primary mt-4">
                    Create Your First Contract
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-7 gap-4 px-4 py-2 text-sm font-medium text-gray-600 border-b border-gray-200">
                    <div>Contract Title</div>
                    <div>Category</div>
                    <div>Status</div>
                    <div>Initiator</div>
                    <div>Receiver</div>
                    <div>Created</div>
                    <div className="text-center">Actions</div>
                  </div>
                  {contracts.map((contract) => (
                    <ContractCard
                      key={contract.id}
                      contract={contract}
                      onUpdate={fetchContracts}
                      onOpenContract={handleOpenContract}
                    />
                  ))}

                  {/* Pagination Controls */}
                  {totalCount > 0 && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
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
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateContractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleContractCreated}
      />

      <ContractViewSheet
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        contractId={selectedContractId}
        onUpdate={fetchContracts}
      />
    </div>
  )
}
