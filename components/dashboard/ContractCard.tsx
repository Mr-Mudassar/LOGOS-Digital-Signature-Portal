'use client'

import { formatDateTime } from '@/lib/utils'
import { Eye, Trash2, Send, FileSignature } from 'lucide-react'
import { useState } from 'react'
import axios from 'axios'

interface ContractCardProps {
  contract: any
  onUpdate: () => void
  onOpenContract: (contractId: string) => void
}

export default function ContractCard({ contract, onUpdate, onOpenContract }: ContractCardProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this contract?')) return

    setDeleting(true)
    try {
      await axios.delete(`/api/contracts/${contract.id}`)
      onUpdate()
    } catch (error) {
      console.error('Error deleting contract:', error)
      alert('Failed to delete contract')
    } finally {
      setDeleting(false)
    }
  }

  const handleAction = (e: React.MouseEvent, action: 'view' | 'delete' | 'send' | 'sign') => {
    e.stopPropagation()

    if (action === 'delete') {
      handleDelete(e)
    } else if (action === 'view') {
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
        <p className="font-medium text-gray-900">{contract.title}</p>
        <p className="text-sm text-gray-600">#{contract.id.slice(0, 8)}</p>
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
        <button
          onClick={(e) => handleAction(e, 'view')}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="View Contract"
        >
          <Eye className="w-4 h-4" />
        </button>

        {canSign && (
          <button
            onClick={(e) => handleAction(e, 'sign')}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
            title="Sign Contract"
          >
            <FileSignature className="w-4 h-4" />
          </button>
        )}

        {canSend && (
          <button
            onClick={(e) => handleAction(e, 'send')}
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
            title="Send to Second Party"
          >
            <Send className="w-4 h-4" />
          </button>
        )}

        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
            title="Delete Contract"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
