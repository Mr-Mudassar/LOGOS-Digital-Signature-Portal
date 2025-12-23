'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, FileSignature } from 'lucide-react'
import axios from 'axios'
import Sidebar from '@/components/dashboard/Sidebar'
import ContractCard from '@/components/dashboard/ContractCard'
import ContractViewSheet from '@/components/ContractViewSheet'

export default function PendingSignaturePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const signingLink = searchParams.get('signingLink')
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (status === 'unauthenticated') {
      // Redirect to sign-in with callback URL
      const callbackUrl = signingLink
        ? `/user/pending-signature?signingLink=${signingLink}`
        : '/user/pending-signature'
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`)
    } else if (status === 'authenticated') {
      fetchPendingContracts()
    }
  }, [status, router, signingLink, currentPage, itemsPerPage])

  const fetchPendingContracts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      })
      const response = await axios.get(`/api/contracts/pending-signature?${params}`)
      setContracts(response.data.contracts)
      setTotalCount(response.data.pagination.total)
      setTotalPages(response.data.pagination.totalPages)

      // Auto-open contract if signingLink is provided
      if (signingLink && response.data.contracts.length > 0) {
        const contract = response.data.contracts.find((c: any) => c.signingLink === signingLink)
        if (contract) {
          setSelectedContractId(contract.id)
          setIsSheetOpen(true)
          // Clear the signingLink from URL after opening
          router.replace('/user/pending-signature', { scroll: false })
        }
      }
    } catch (error) {
      console.error('Error fetching pending signature contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenContract = (contractId: string) => {
    setSelectedContractId(contractId)
    setIsSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setIsSheetOpen(false)
    setSelectedContractId(null)
  }

  // Reset to page 1 when itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

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
                <FileSignature className="w-8 h-8 text-primary" />
                Pending Signature
              </h1>
              <p className="text-gray-600 mt-1">
                Contracts shared with you that require your signature
              </p>
            </div>
          </div>

          {/* Contracts List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <FileSignature className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold">Awaiting Your Signature</h2>
              </div>
              <p className="text-sm text-gray-600">
                {totalCount} {totalCount === 1 ? 'contract' : 'contracts'} waiting for your review
                and signature
              </p>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading contracts...</p>
                </div>
              ) : contracts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <FileSignature className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Signatures</h3>
                  <p className="text-gray-600">
                    You don&apos;t have any contracts waiting for your signature at the moment.
                  </p>
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
                      onUpdate={fetchPendingContracts}
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

      <ContractViewSheet
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        contractId={selectedContractId}
        onUpdate={fetchPendingContracts}
      />
    </div>
  )
}
