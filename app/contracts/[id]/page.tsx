'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import axios from 'axios'
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
  const { data: session, status } = useSession()
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
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null)

  // Role-based routing
  const isAdmin = session?.user?.role === 'ADMIN'
  const backUrl = isAdmin ? '/admin/dashboard' : '/user/all-contracts'

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
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (contractId && status === 'authenticated') {
      fetchContract()
    }
  }, [contractId, fetchContract, status, router])

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
        content: editedContent,
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

  const handlePreviewPDF = async () => {
    if (!contract) return

    try {
      setGeneratingPDF(true)
      toast.loading('Generating PDF preview...', { id: 'pdf-preview' })

      // Replace signature placeholders with underscores for preview
      let previewContent = contract.aiGeneratedContent || ''
      previewContent = previewContent
        .replace(/{{INITIATOR_NAME}}/g, '_______________________')
        .replace(/{{INITIATOR_DATE}}/g, '_______________________')
        .replace(/{{RECEIVER_NAME}}/g, '_______________________')
        .replace(/{{RECEIVER_DATE}}/g, '_______________________')

      // Generate PDF preview
      const response = await axios.post(
        `/api/contracts/generate-preview`,
        {
          contractId: contract.id,
          content: previewContent,
          title: contract.title,
        },
        {
          responseType: 'blob',
        }
      )

      // Create blob URL for preview
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setPreviewPdfUrl(url)
      setShowPDFViewer(true)
      toast.success('PDF preview generated!', { id: 'pdf-preview' })
    } catch (err: any) {
      toast.error('Failed to generate PDF preview', { id: 'pdf-preview' })
      console.error('PDF preview error:', err)
    } finally {
      setGeneratingPDF(false)
    }
  }

  const isInitiator = contract?.initiatorId === session?.user?.id
  const isReceiver =
    contract?.receiverId === session?.user?.id || contract?.receiverEmail === session?.user?.email
  const hasInitiatorSigned = contract?.signatures.some((s) => s.type === 'INITIATOR')
  const hasReceiverSigned = contract?.signatures.some((s) => s.type === 'RECEIVER')

  // Can only edit when DRAFT and initiator has NOT signed yet
  const canEdit = contract?.status === 'DRAFT' && isInitiator && !hasInitiatorSigned && !isAdmin

  // Can sign only when DRAFT, is initiator, and hasn't signed yet
  const canSign = contract?.status === 'DRAFT' && isInitiator && !hasInitiatorSigned && !isAdmin

  // Receiver can sign when awaiting signature and hasn't signed yet
  const canReceiverSign =
    contract?.status === 'AWAITING_SIGNATURE' && isReceiver && !hasReceiverSigned && !isAdmin

  // Can send to receiver ONLY after initiator has signed
  const canSend = hasInitiatorSigned && contract?.status === 'DRAFT' && isInitiator && !isAdmin

  if (status === 'loading' || loading) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </main>
    )
  }

  if (error || !contract) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Contract not found'}</p>
          <button onClick={() => router.push(backUrl)} className="text-primary hover:underline">
            Back to {isAdmin ? 'Dashboard' : 'Contracts'}
          </button>
        </div>
      </main>
    )
  }

  return (
    <>
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push(backUrl)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {isAdmin ? 'Dashboard' : 'Contracts'}
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
          {/* PDF Preview - Always show */}
          <LoadingButton
            onClick={
              contract.status === 'COMPLETED' && contract.pdfUrl
                ? () => {
                    setPreviewPdfUrl(contract.pdfUrl || null)
                    setShowPDFViewer(true)
                  }
                : handlePreviewPDF
            }
            variant="outline"
            className="flex items-center gap-2"
            loading={generatingPDF}
            loadingText="Generating..."
          >
            <FileText className="w-4 h-4" />
            {contract.status === 'COMPLETED' ? 'View Signed PDF' : 'Preview as PDF'}
          </LoadingButton>

          {/* Edit Button - Only when not signed yet */}
          {!isAdmin && canEdit && !isEditing && (
            <LoadingButton
              onClick={handleEdit}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Content
            </LoadingButton>
          )}

          {/* Sign Button - For initiator (first party) */}
          {!isAdmin && canSign && !isEditing && (
            <LoadingButton
              onClick={() => setShowSignConfirm(true)}
              className="flex items-center gap-2"
            >
              <FileSignature className="w-4 h-4" />
              Sign Contract
            </LoadingButton>
          )}

          {/* Send to Receiver - Only after initiator has signed */}
          {!isAdmin && canSend && (
            <LoadingButton
              onClick={() => setShowSendConfirm(true)}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Share to Second Party
            </LoadingButton>
          )}

          {/* Sign Button - For receiver (second party) */}
          {!isAdmin && canReceiverSign && (
            <LoadingButton
              onClick={() => setShowSignConfirm(true)}
              className="flex items-center gap-2"
            >
              <FileSignature className="w-4 h-4" />
              Sign Contract
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
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">First Party (Initiator)</p>
                  {hasInitiatorSigned ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                      ✓ Signed
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      Pending
                    </span>
                  )}
                </div>
                <p className="font-medium">{contract.initiatorName}</p>
                <p className="text-sm text-gray-500">{contract.initiatorEmail}</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Second Party (Receiver)</p>
                  {hasReceiverSigned ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                      ✓ Signed
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      Pending
                    </span>
                  )}
                </div>
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
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Note:</strong> Do not edit or remove the signature placeholders at
                    the bottom (INITIATOR_NAME, RECEIVER_NAME, dates). These will be automatically
                    filled when parties sign the contract.
                  </p>
                </div>
                <ContractEditor content={editedContent} onChange={setEditedContent} />
                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <LoadingButton onClick={handleCancelEdit} variant="outline">
                    Cancel
                  </LoadingButton>
                  <LoadingButton onClick={handleSaveEdit} loading={saving} loadingText="Saving...">
                    Save Changes
                  </LoadingButton>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg">
                <ContractEditor
                  content={contract.aiGeneratedContent || '<p>No content available</p>'}
                  editable={false}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals - Only show for non-admin users */}
      {!isAdmin && (
        <>
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
        </>
      )}

      {previewPdfUrl && (
        <PDFViewerSheet
          isOpen={showPDFViewer}
          onClose={() => {
            setShowPDFViewer(false)
            // Clean up blob URL if it's not from S3
            if (previewPdfUrl && previewPdfUrl.startsWith('blob:')) {
              URL.revokeObjectURL(previewPdfUrl)
            }
          }}
          pdfUrl={previewPdfUrl}
          contractId={contract.id}
          contractTitle={contract.title}
          contractContent={contract.aiGeneratedContent || undefined}
          category={contract.category}
          createdAt={contract.createdAt}
        />
      )}
    </>
  )
}
