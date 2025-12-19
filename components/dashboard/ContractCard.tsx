'use client'

import { formatDateTime } from '@/lib/utils'
import { Eye, Trash2, Send, FileSignature, MoreVertical } from 'lucide-react'
import { useState } from 'react'
import axios from 'axios'
import ConfirmationModal from '@/components/ConfirmationModal'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'

interface ContractCardProps {
  contract: any
  onUpdate: () => void
  onOpenContract: (contractId: string) => void
}

export default function ContractCard({ contract, onUpdate, onOpenContract }: ContractCardProps) {
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState('')

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
      AWAITING_SIGNATURE: 'Pending',
      COMPLETED: 'Signed',
    }

    return (
      <span className={`badge ${badges[status as keyof typeof badges]}`}>
        {status === 'COMPLETED' && '✓ '}
        {status === 'AWAITING_SIGNATURE' && '🔵 '}
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getContractType = () => {
    // You can enhance this based on your needs
    if (contract.title.toLowerCase().includes('housing')) return 'Housing'
    if (contract.title.toLowerCase().includes('employment')) return 'Employment'
    return 'Business'
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
    <div className="grid grid-cols-6 gap-4 px-4 py-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
      <div className="cursor-pointer" onClick={() => onOpenContract(contract.id)}>
        <p className="font-medium text-gray-900 truncate" title={contract.title}>
          {contract.title}
        </p>
      </div>

      <div className="flex items-center cursor-pointer" onClick={() => onOpenContract(contract.id)}>
        <p className="text-gray-700">{getContractType()}</p>
      </div>

      <div className="flex items-center cursor-pointer" onClick={() => onOpenContract(contract.id)}>
        {getStatusBadge(contract.status)}
      </div>

      <div className="flex items-center cursor-pointer" onClick={() => onOpenContract(contract.id)}>
        <p className="text-gray-700">{getProvider()}</p>
      </div>

      <div className="flex items-center cursor-pointer" onClick={() => onOpenContract(contract.id)}>
        <p className="text-sm text-gray-600">{formatDateTime(contract.updatedAt)}</p>
      </div>

      <div className="flex items-center justify-end gap-2">
        <DropdownMenu
          trigger={
            <button
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              title="Actions"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          }
        >
          <DropdownMenuItem
            onClick={(e) => handleAction(e, 'view')}
            icon={<Eye className="w-4 h-4" />}
          >
            View
          </DropdownMenuItem>

          {canSign && (
            <DropdownMenuItem
              onClick={(e) => handleAction(e, 'sign')}
              icon={<FileSignature className="w-4 h-4" />}
            >
              Sign Contract
            </DropdownMenuItem>
          )}

          {canSend && (
            <DropdownMenuItem
              onClick={(e) => handleAction(e, 'send')}
              icon={<Send className="w-4 h-4" />}
            >
              Send to Second Party
            </DropdownMenuItem>
          )}

          {canDelete && (
            <DropdownMenuItem
              onClick={handleDeleteClick}
              icon={<Trash2 className="w-4 h-4" />}
              variant="danger"
              disabled={deleting}
            >
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenu>
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
        <div className="col-span-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {deleteError}
        </div>
      )}
    </div>
  )
}
