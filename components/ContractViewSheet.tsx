'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import ConfirmationModal from './ConfirmationModal'
import ContractEditor from './ContractEditor'
import { LoadingButton } from './ui/loading-button'
import { Edit, FileSignature, Send, X, Check } from 'lucide-react'
import { toast } from 'sonner'

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
}

interface ContractViewSheetProps {
  isOpen: boolean
  onClose: () => void
  contractId: string | null
  onUpdate?: () => void
}

export default function ContractViewSheet({
  isOpen,
  onClose,
  contractId,
  onUpdate,
}: ContractViewSheetProps) {
  const { data: session } = useSession()
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isOpen && contractId) {
      fetchContract()
    } else {
      setContract(null)
      setLoading(true)
      setError('')
      setIsEditing(false)
    }
  }, [isOpen, contractId])

  const fetchContract = async () => {
    if (!contractId) return

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
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedContent(contract?.aiGeneratedContent || '')
  }

  const handleSaveEdit = async () => {
    if (!contractId) return

    setSaving(true)
    try {
      await axios.put(`/api/contracts/${contractId}/edit`, {
        content: editedContent,
      })
      setContract((prev) => (prev ? { ...prev, aiGeneratedContent: editedContent } : null))
      setIsEditing(false)
      toast.success('Contract updated successfully')
      if (onUpdate) onUpdate()
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to save changes'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  const handleSignContract = () => {
    setShowSignConfirm(true)
  }

  const handleSignatureConfirm = async () => {
    if (!contractId || !contract) return

    setSigning(true)
    try {
      // Determine if user is initiator or receiver
      const isReceiverUser =
        session?.user?.id === contract.receiverId || session?.user?.email === contract.receiverEmail
      const signerType = isReceiverUser ? 'receiver' : 'initiator'
      const signerName = isReceiverUser ? contract.receiverName : contract.initiatorName

      await axios.post(`/api/contracts/${contractId}/sign`, {
        signerType,
        signerName,
      })

      setShowSignConfirm(false)
      toast.success('Contract signed successfully!')
      fetchContract()
      if (onUpdate) onUpdate()
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to sign contract'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setSigning(false)
    }
  }

  const handleSendClick = () => {
    setShowSendConfirm(true)
  }

  const handleSendToReceiver = async () => {
    if (!contract || !contractId) return

    setSending(true)
    try {
      await axios.post(`/api/contracts/${contractId}/send`)
      setShowSendConfirm(false)
      toast.success('Contract sent successfully!')
      onClose()
      if (onUpdate) onUpdate()
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to send contract'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setSending(false)
    }
  }

  // Helper function to replace placeholders with visual underlines for display
  // Only replaces if placeholders still exist (not yet signed)
  const getDisplayContent = (content: string): string => {
    // Check if content has any placeholders
    if (!content.includes('{{')) {
      // No placeholders, return content as-is (already signed)
      return content
    }

    // Replace placeholders with underlines
    return content
      .replace(
        /\{\{INITIATOR_NAME\}\}/g,
        '<span class="inline-block border-b-2 border-gray-400 min-w-[200px] text-center text-gray-400">_________________</span>'
      )
      .replace(
        /\{\{INITIATOR_DATE\}\}/g,
        '<span class="inline-block border-b-2 border-gray-400 min-w-[200px] text-center text-gray-400">_________________</span>'
      )
      .replace(
        /\{\{RECEIVER_NAME\}\}/g,
        '<span class="inline-block border-b-2 border-gray-400 min-w-[200px] text-center text-gray-400">_________________</span>'
      )
      .replace(
        /\{\{RECEIVER_DATE\}\}/g,
        '<span class="inline-block border-b-2 border-gray-400 min-w-[200px] text-center text-gray-400">_________________</span>'
      )
  }

  if (!isOpen) return null

  const isInitiator = contract && session?.user?.id === contract.initiatorId
  const isReceiver =
    contract &&
    (session?.user?.id === contract.receiverId || session?.user?.email === contract.receiverEmail)
  const hasInitiatorSigned = contract?.signatures.some((sig) => sig.type === 'INITIATOR')
  const hasReceiverSigned = contract?.signatures.some((sig) => sig.type === 'RECEIVER')
  const initiatorSignature = contract?.signatures.find((sig) => sig.type === 'INITIATOR')
  const receiverSignature = contract?.signatures.find((sig) => sig.type === 'RECEIVER')
  const canReceiverSign =
    isReceiver && contract?.status === 'AWAITING_SIGNATURE' && !hasReceiverSigned
  const canEdit = isInitiator && !hasInitiatorSigned && !hasReceiverSigned

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl">{contract?.title || 'Loading...'}</SheetTitle>
            <SheetDescription>
              {contract && (
                <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100">
                  {contract.status.replace('_', ' ').toLowerCase()}
                </span>
              )}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading contract...</p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {!loading && contract && (
              <>
                {/* Action Buttons */}
                <div className="flex gap-3 justify-end border-b pb-4">
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
                  {hasInitiatorSigned && contract.status === 'DRAFT' && isInitiator && (
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
                  {canReceiverSign && (
                    <LoadingButton
                      onClick={handleSignContract}
                      loading={signing}
                      loadingText="Signing..."
                      className="flex items-center gap-2"
                    >
                      <FileSignature className="w-4 h-4" />
                      Sign Contract
                    </LoadingButton>
                  )}
                </div>

                {/* Parties Info */}
                <div className="grid grid-cols-2 gap-6 pb-6 border-b">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">First Party</h3>
                    <p className="text-gray-900 font-medium">{contract.initiatorName}</p>
                    {contract.initiatorEmail && (
                      <p className="text-sm text-gray-600">{contract.initiatorEmail}</p>
                    )}
                    {hasInitiatorSigned && (
                      <span className="inline-flex items-center text-xs text-green-700 bg-green-50 px-2 py-1 rounded mt-2">
                        <Check className="w-3 h-3 mr-1" /> Signed
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Second Party</h3>
                    <p className="text-gray-900 font-medium">{contract.receiverName}</p>
                    <p className="text-sm text-gray-600">{contract.receiverEmail}</p>
                    {hasReceiverSigned && (
                      <span className="inline-flex items-center text-xs text-green-700 bg-green-50 px-2 py-1 rounded mt-2">
                        <Check className="w-3 h-3 mr-1" /> Signed
                      </span>
                    )}
                  </div>
                </div>

                {/* Contract Content */}
                {isEditing ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Edit Contract Content
                    </label>
                    <ContractEditor
                      content={editedContent}
                      onChange={setEditedContent}
                      editable={true}
                    />
                    <div className="flex justify-end gap-3 mt-4">
                      <LoadingButton onClick={handleCancelEdit} variant="outline">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </LoadingButton>
                      <LoadingButton
                        onClick={handleSaveEdit}
                        loading={saving}
                        loadingText="Saving..."
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Save Changes
                      </LoadingButton>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Contract Terms</h3>
                    <ContractEditor
                      content={getDisplayContent(
                        contract.aiGeneratedContent || '<p>No content generated yet.</p>'
                      )}
                      onChange={() => {}}
                      editable={false}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Sign Confirmation Modal */}
      {contract && (
        <ConfirmationModal
          isOpen={showSignConfirm}
          onClose={() => setShowSignConfirm(false)}
          onConfirm={handleSignatureConfirm}
          title="Sign Contract"
          description={`Are you sure you want to sign this contract? Your name (${
            isReceiver ? contract.receiverName : contract.initiatorName
          }) will be added to the document with the current date.`}
          confirmText="Sign Contract"
          cancelText="Cancel"
          variant="info"
          loading={signing}
        />
      )}

      {/* Send Confirmation Modal */}
      {contract && (
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
      )}
    </>
  )
}
