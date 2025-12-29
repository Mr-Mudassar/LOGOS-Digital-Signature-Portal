'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import Sidebar from '@/components/dashboard/Sidebar'
import { ArrowLeft, Edit, FileSignature, Send, FileText } from 'lucide-react'
import { LoadingButton } from '@/components/ui/loading-button'
import { toast } from 'sonner'
import ConfirmationModal from '@/components/ConfirmationModal'
import ContractEditor from '@/components/ContractEditor'
import PDFViewerSheet from '@/components/PDFViewerSheet'

interface Signature {
  id: string
  type: 'INITIATOR' | 'RECEIVER'
  signatureData: string
  signedAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

interface Contract {
  id: string
  title: string
  status: string
  aiGeneratedContent: string | null
  initiatorName: string
  initiatorEmail: string | null
  receiverName: string
  receiverEmail: string
  initiatorId: string
  receiverId: string | null
  signatures: Signature[]
  createdAt: string
  updatedAt: string
  pdfUrl?: string | null
  category: string
}

export default function ContractDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const contractId = params.id as string

  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [showSignConfirm, setShowSignConfirm] = useState(false)
  const [signing, setSigning] = useState(false)
  const [sending, setSending] = useState(false)
  const [showSendConfirm, setShowSendConfirm] = useState(false)
  const [showPDFViewer, setShowPDFViewer] = useState(false)

  const fetchContract = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await axios.get(`/api/contracts/${contractId}`)
      setContract(response.data.contract)
      setEditedContent(response.data.contract.aiGeneratedContent || '')
      setLoading(false)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load contract')
      setLoading(false)
    }
  }, [contractId])

  useEffect(() => {
    if (contractId) {
      fetchContract()
    }
  }, [contractId, fetchContract])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedContent(contract?.aiGeneratedContent || '')
  }

  const handleSaveEdit = async () => {
    if (!contract) return

    try {
      setSaving(true)
      await axios.put(`/api/contracts/${contract.id}/edit`, {
        aiGeneratedContent: editedContent,
      })
      toast.success('Contract updated successfully!')
      setIsEditing(false)
      fetchContract()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update contract')
    } finally {
      setSaving(false)
    }
  }

  const handleSignContract = async () => {
    if (!contract) return

    try {
      setSigning(true)
      const signerType = isInitiator ? 'initiator' : 'receiver'
      const signerName = isInitiator ? contract.initiatorName : session?.user?.name || ''

      await axios.post(`/api/contracts/${contract.id}/sign`, {
        signerName,
        signerType,
      })
      toast.success('Contract signed successfully!')
      setShowSignConfirm(false)
      fetchContract()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to sign contract')
    } finally {
      setSigning(false)
    }
  }

  const handleSendToReceiver = async () => {
    if (!contract) return

    try {
      setSending(true)
      await axios.post(`/api/contracts/${contract.id}/send`)
      toast.success('Contract sent to receiver successfully!')
      setShowSendConfirm(false)
      fetchContract()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send contract')
    } finally {
      setSending(false)
    }
  }

  const isInitiator = contract?.initiatorId === session?.user?.id
  const isReceiver = contract?.receiverId === session?.user?.id
  const canEdit = contract?.status === 'DRAFT' && isInitiator
  const canSign =
    contract?.status === 'DRAFT' &&
    isInitiator &&
    !contract.signatures.some((s) => s.type === 'INITIATOR')
  const hasInitiatorSigned = contract?.signatures.some((s) => s.type === 'INITIATOR')
  const canSend = hasInitiatorSigned && contract?.status === 'DRAFT' && isInitiator

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
      </div>
    )
  }

  if (error || !contract) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Contract not found'}</p>
            <button
              onClick={() => router.push('/user/all-contracts')}
              className="text-primary hover:underline"
            >
              Back to Contracts
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/user/all-contracts')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Contracts
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{contract.title}</h1>
                <p className="text-gray-600 mt-1">
                  Created {new Date(contract.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  contract.status === 'DRAFT'
                    ? 'bg-gray-100 text-gray-800'
                    : contract.status === 'AWAITING_SIGNATURE'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {contract.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            {contract.pdfUrl && contract.status === 'COMPLETED' && (
              <LoadingButton
                onClick={() => setShowPDFViewer(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                View PDF Contract
              </LoadingButton>
            )}
            {canEdit && !isEditing && (
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
                  onClick={() => setShowSignConfirm(true)}
                  className="flex items-center gap-2"
                >
                  <FileSignature className="w-4 h-4" />
                  Sign Contract
                </LoadingButton>
              </>
            )}
            {canSend && (
              <LoadingButton
                onClick={() => setShowSendConfirm(true)}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send to Receiver
              </LoadingButton>
            )}
          </div>

          {/* Contract Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Contract Parties */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-4">Contract Parties</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">First Party (Initiator)</p>
                  <p className="font-medium">{contract.initiatorName}</p>
                  <p className="text-sm text-gray-500">{contract.initiatorEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Second Party</p>
                  <p className="font-medium">{contract.receiverName || 'Pending'}</p>
                  <p className="text-sm text-gray-500">{contract.receiverEmail}</p>
                </div>
              </div>
            </div>

            {/* Contract Content */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Contract Content</h3>
              {isEditing ? (
                <div>
                  <ContractEditor content={editedContent} onChange={setEditedContent} />
                  <div className="flex gap-3 mt-6 pt-6 border-t">
                    <LoadingButton onClick={handleCancelEdit} variant="outline">
                      Cancel
                    </LoadingButton>
                    <LoadingButton
                      onClick={handleSaveEdit}
                      loading={saving}
                      loadingText="Saving..."
                    >
                      Save Changes
                    </LoadingButton>
                  </div>
                </div>
              ) : (
                <div
                  className="prose prose-sm max-w-none prose-headings:font-semibold prose-p:text-gray-700 prose-p:leading-relaxed prose-ul:list-disc prose-ol:list-decimal prose-li:text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: contract.aiGeneratedContent || '<p>No content available</p>',
                  }}
                />
              )}
            </div>

            {/* Signatures */}
            {contract.signatures.length > 0 && (
              <div className="p-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Signatures</h3>
                <div className="space-y-3">
                  {contract.signatures.map((signature, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
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
          </div>
        </div>
      </main>

      {/* Modals */}
      <ConfirmationModal
        isOpen={showSignConfirm}
        onClose={() => setShowSignConfirm(false)}
        onConfirm={handleSignContract}
        title="Sign Contract"
        description="Are you sure you want to sign this contract? This action cannot be undone."
        confirmText="Sign Contract"
        cancelText="Cancel"
        variant="info"
        loading={signing}
      />

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
