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
import SignatureModal from './SignatureModal'
import { Edit, FileSignature, Send, X, Check } from 'lucide-react'

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
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [signing, setSigning] = useState(false)
  const [sending, setSending] = useState(false)

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
      await axios.patch(`/api/contracts/${contractId}`, {
        aiGeneratedContent: editedContent,
      })
      setContract((prev) => (prev ? { ...prev, aiGeneratedContent: editedContent } : null))
      setIsEditing(false)
      if (onUpdate) onUpdate()
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
    if (!contractId) return

    setSigning(true)
    try {
      await axios.post(`/api/contracts/${contractId}/sign`, {
        signatureData,
        signerType: 'initiator',
      })

      setShowSignatureModal(false)
      fetchContract()
      if (onUpdate) onUpdate()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save signature')
    } finally {
      setSigning(false)
    }
  }

  const handleSendToReceiver = async () => {
    if (!contract || !contractId) return

    if (!confirm(`Send this contract to ${contract.receiverEmail}?`)) {
      return
    }

    setSending(true)
    try {
      await axios.post(`/api/contracts/${contractId}/send`)
      alert('Contract sent successfully!')
      onClose()
      if (onUpdate) onUpdate()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send contract')
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  const isInitiator = contract && session?.user?.id === contract.initiatorId
  const hasInitiatorSigned = contract?.signatures.some((sig) => sig.type === 'INITIATOR')
  const hasReceiverSigned = contract?.signatures.some((sig) => sig.type === 'RECEIVER')
  const initiatorSignature = contract?.signatures.find((sig) => sig.type === 'INITIATOR')
  const receiverSignature = contract?.signatures.find((sig) => sig.type === 'RECEIVER')

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
                  {!isEditing && !hasInitiatorSigned && isInitiator && (
                    <>
                      <button
                        onClick={handleEdit}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Content
                      </button>
                      <button
                        onClick={handleSignContract}
                        className="btn-primary flex items-center gap-2"
                      >
                        <FileSignature className="w-4 h-4" />
                        Sign Contract
                      </button>
                    </>
                  )}
                  {hasInitiatorSigned && contract.status === 'DRAFT' && isInitiator && (
                    <button
                      onClick={handleSendToReceiver}
                      disabled={sending}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {sending ? 'Sending...' : 'Send to Second Party'}
                    </button>
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
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm"
                      placeholder="Contract content..."
                    />
                    <div className="flex justify-end gap-3 mt-4">
                      <button onClick={handleCancelEdit} className="btn-secondary">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                      <button onClick={handleSaveEdit} disabled={saving} className="btn-primary">
                        <Check className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Contract Terms</h3>
                    <div className="whitespace-pre-wrap font-serif text-gray-900 bg-gray-50 p-6 rounded-lg border">
                      {contract.aiGeneratedContent || 'No content generated yet.'}
                    </div>

                    {/* Signatures Section */}
                    {(hasInitiatorSigned || hasReceiverSigned) && (
                      <div className="mt-8 space-y-6">
                        <h3 className="text-sm font-semibold text-gray-700">Signatures</h3>
                        <div className="grid grid-cols-2 gap-6">
                          {/* Initiator Signature */}
                          <div className="border rounded-lg p-4 bg-white">
                            <p className="text-xs text-gray-600 mb-2">First Party Signature</p>
                            {initiatorSignature ? (
                              <div>
                                <img
                                  src={initiatorSignature.signatureData}
                                  alt="Initiator signature"
                                  className="w-full h-24 object-contain border-b border-gray-200 mb-2"
                                />
                                <p className="text-xs text-gray-500">
                                  Signed on{' '}
                                  {new Date(initiatorSignature.signedAt).toLocaleDateString()}
                                </p>
                                <p className="text-xs font-medium text-gray-900">
                                  {initiatorSignature.user.name || initiatorSignature.user.email}
                                </p>
                              </div>
                            ) : (
                              <div className="h-24 flex items-center justify-center text-gray-400 text-sm border border-dashed rounded">
                                Awaiting signature
                              </div>
                            )}
                          </div>

                          {/* Receiver Signature */}
                          <div className="border rounded-lg p-4 bg-white">
                            <p className="text-xs text-gray-600 mb-2">Second Party Signature</p>
                            {receiverSignature ? (
                              <div>
                                <img
                                  src={receiverSignature.signatureData}
                                  alt="Receiver signature"
                                  className="w-full h-24 object-contain border-b border-gray-200 mb-2"
                                />
                                <p className="text-xs text-gray-500">
                                  Signed on{' '}
                                  {new Date(receiverSignature.signedAt).toLocaleDateString()}
                                </p>
                                <p className="text-xs font-medium text-gray-900">
                                  {receiverSignature.user.name || receiverSignature.user.email}
                                </p>
                              </div>
                            ) : (
                              <div className="h-24 flex items-center justify-center text-gray-400 text-sm border border-dashed rounded">
                                Awaiting signature
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Signature Modal */}
      {contract && (
        <SignatureModal
          isOpen={showSignatureModal}
          onClose={() => setShowSignatureModal(false)}
          onConfirm={handleSignatureConfirm}
          signerName={contract.initiatorName}
        />
      )}
    </>
  )
}
