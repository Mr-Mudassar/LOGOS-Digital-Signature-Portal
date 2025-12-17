'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import SignatureModal from '@/components/SignatureModal'
import ConfirmationModal from '@/components/ConfirmationModal'
import { LoadingButton } from '@/components/ui/loading-button'
import { ArrowLeft, Edit, FileSignature, Send } from 'lucide-react'

interface Contract {
  id: string
  title: string
  status: string
  aiGeneratedContent: string | null
  initiatorName: string
  receiverName: string
  receiverEmail: string
  signatures: any[]
}

export default function ContractReviewPage() {
  const params = useParams()
  const router = useRouter()
  const contractId = params.id as string

  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [signing, setSigning] = useState(false)
  const [sending, setSending] = useState(false)
  const [showSendConfirm, setShowSendConfirm] = useState(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchContract()
  }, [contractId])

  const fetchContract = async () => {
    try {
      const response = await axios.get(`/api/contracts/${contractId}`)
      setContract(response.data.contract)
      setEditedContent(response.data.contract.aiGeneratedContent || '')
      setLoading(false)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load contract')
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedContent(contract?.aiGeneratedContent || '')
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      await axios.patch(`/api/contracts/${contractId}`, {
        aiGeneratedContent: editedContent,
      })
      setContract((prev) => (prev ? { ...prev, aiGeneratedContent: editedContent } : null))
      setIsEditing(false)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleSignContract = () => {
    setShowSignatureModal(true)
  }

  const handleSignatureConfirm = async (signatureData: string) => {
    setSigning(true)
    try {
      await axios.post(`/api/contracts/${contractId}/sign`, {
        signatureData,
        signerType: 'initiator',
      })

      setShowSignatureModal(false)
      fetchContract() // Refresh contract data
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save signature')
    } finally {
      setSigning(false)
    }
  }

  const handleSendClick = () => {
    setShowSendConfirm(true)
  }

  const handleSendToReceiver = async () => {
    setSending(true)
    try {
      await axios.post(`/api/contracts/${contractId}/send`)
      setShowSendConfirm(false)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send contract')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contract...</p>
        </div>
      </div>
    )
  }

  if (error && !contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary mt-4">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!contract) return null

  const hasInitiatorSigned = contract.signatures.some((sig) => sig.type === 'INITIATOR')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Status:{' '}
                <span className="font-medium">
                  {contract.status.replace('_', ' ').toLowerCase()}
                </span>
              </p>
            </div>
            <div className="flex gap-3">
              {!isEditing && !hasInitiatorSigned && (
                <>
                  <LoadingButton
                    onClick={handleEdit}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Content
                  </LoadingButton>
                  <LoadingButton
                    onClick={handleSignContract}
                    loading={signing}
                    loadingText="Signing..."
                    className="flex items-center gap-2"
                  >
                    <FileSignature className="w-4 h-4" />
                    Sign Contract
                  </LoadingButton>
                </>
              )}
              {hasInitiatorSigned && contract.status === 'DRAFT' && (
                <LoadingButton
                  onClick={handleSendClick}
                  loading={sending}
                  loadingText="Sending..."
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send to Second Party
                </LoadingButton>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-8">
            {/* Parties Info */}
            <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">First Party</h3>
                <p className="text-gray-900">{contract.initiatorName}</p>
                {hasInitiatorSigned && (
                  <span className="inline-flex items-center text-xs text-green-700 bg-green-50 px-2 py-1 rounded mt-2">
                    ✓ Signed
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Second Party</h3>
                <p className="text-gray-900">{contract.receiverName}</p>
                <p className="text-sm text-gray-600">{contract.receiverEmail}</p>
              </div>
            </div>

            {/* Contract Content */}
            {isEditing ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Edit Contract Content
                </label>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm"
                  placeholder="Contract content..."
                />
                <div className="flex justify-end gap-3 mt-4">
                  <LoadingButton onClick={handleCancelEdit} variant="outline">
                    Cancel
                  </LoadingButton>
                  <LoadingButton onClick={handleSaveEdit} loading={saving} loadingText="Saving...">
                    Save Changes
                  </LoadingButton>
                </div>
              </div>
            ) : (
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap font-serif text-gray-900">
                  {contract.aiGeneratedContent || 'No content generated yet.'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onConfirm={handleSignatureConfirm}
        signerName={contract.initiatorName}
        loading={signing}
      />

      {/* Send Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSendConfirm}
        onClose={() => setShowSendConfirm(false)}
        onConfirm={handleSendToReceiver}
        title="Send Contract"
        description={`Send this contract to ${contract.receiverEmail} for their signature?`}
        confirmText="Send"
        cancelText="Cancel"
        variant="info"
        loading={sending}
      />
    </div>
  )
}
