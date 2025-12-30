'use client'

import { formatDateTime } from '@/lib/utils'
import { Eye, Trash2, Send, FileSignature, MoreVertical, Download, FileText } from 'lucide-react'
import { useState } from 'react'
import axios from 'axios'
import ConfirmationModal from '@/components/ConfirmationModal'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import PDFViewerSheet from '@/components/PDFViewerSheet'

interface ContractCardProps {
  contract: any
  onUpdate: () => void
  onOpenContract: (contractId: string) => void
  isPendingSignature?: boolean
}

export default function ContractCard({
  contract,
  onUpdate,
  onOpenContract,
  isPendingSignature = false,
}: ContractCardProps) {
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [showPDFViewer, setShowPDFViewer] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError('')
    try {
      await axios.delete(`/api/contracts/${contract.id}`)
      setShowDeleteConfirm(false)
      onUpdate()
    } catch (error) {
      console.error('Error deleting contract:', error)
      setDeleteError('Failed to delete contract. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(true)
  }

  const handleAction = (e: React.MouseEvent, action: 'view' | 'send' | 'sign') => {
    e.stopPropagation()

    if (action === 'view') {
      onOpenContract(contract.id)
    } else if (action === 'send' || action === 'sign') {
      // Open contract to perform action
      onOpenContract(contract.id)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      DRAFT: 'badge-draft',
      AWAITING_SIGNATURE: 'badge-awaiting',
      COMPLETED: 'badge-completed',
    }

    const labels = {
      DRAFT: 'Draft',
      AWAITING_SIGNATURE: 'Awaiting Signature',
      COMPLETED: 'Completed',
    }

    return (
      <span className={`badge ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getCategory = () => {
    // Map category enum to display labels
    const categoryLabels: Record<string, string> = {
      HOUSING: 'Housing',
      LAND: 'Land',
      CIVIL_SERVICE_COMMISSION: 'Civil Service',
      MINISTRY_OF_JUSTICE: 'Justice',
      OTHER: 'Other',
    }
    return categoryLabels[contract.category] || contract.category || 'Other'
  }

  const getProvider = () => {
    return contract.initiator.name || contract.initiator.email
  }

  const canDelete = contract.status === 'DRAFT'
  const canSign =
    contract.status === 'DRAFT' && !contract.signatures?.some((s: any) => s.type === 'INITIATOR')
  const canSend =
    contract.signatures?.some((s: any) => s.type === 'INITIATOR') && contract.status === 'DRAFT'

  return (
    <div className="grid grid-cols-7 gap-4 px-4 py-2 border  hover:bg-gray-50 transition-colors group items-center">
      <p className="font-medium text-gray-900 truncate " title={contract.title}>
        {contract.title}
      </p>

      <div>
        <p className="text-gray-700">{getCategory()}</p>
      </div>

      <div>{getStatusBadge(contract.status)}</div>

      <div className="min-w-0">
        <p className="text-gray-700 truncate">{contract.initiator.name || 'Unknown'}</p>
        {contract.initiator.email && (
          <p className="text-xs text-gray-500 truncate">{contract.initiator.email}</p>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-gray-700 truncate">{contract.receiverName || 'Not assigned'}</p>
        {contract.receiverEmail && (
          <p className="text-xs text-gray-500 truncate">{contract.receiverEmail}</p>
        )}
      </div>

      <div>
        <p className="text-sm text-gray-600 truncate">{formatDateTime(contract.updatedAt)}</p>
      </div>

      <div className="flex items-center justify-center gap-2">
        {isPendingSignature ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onOpenContract(contract.id)
            }}
            className="font-bold text-primary-dark text-sm"
          >
            Sign Contract
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onOpenContract(contract.id)
            }}
            className="font-bold text-primary-dark text-sm"
          >
            View Details
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Contract"
        description={`Are you sure you want to delete "${contract.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />

      {deleteError && (
        <div className="col-span-7 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {deleteError}
        </div>
      )}

      {/* PDF Viewer Sheet */}
      {contract.pdfUrl && (
        <PDFViewerSheet
          isOpen={showPDFViewer}
          onClose={() => setShowPDFViewer(false)}
          pdfUrl={contract.pdfUrl}
          contractTitle={contract.title}
        />
      )}
    </div>
  )
}
