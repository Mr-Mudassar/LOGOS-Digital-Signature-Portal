'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import SignatureModal from '@/components/SignatureModal'
import { LoadingButton } from '@/components/ui/loading-button'
import { FileSignature, CheckCircle, ArrowLeft, Check } from 'lucide-react'

interface Signature {
  id: string
  type: 'INITIATOR' | 'RECEIVER'
  signatureData: string
  signedAt: string
  user: {
    id: string
    name: string | null
  }
}

interface Contract {
  id: string
  title: string
  status: string
  aiGeneratedContent: string | null
  initiatorName: string
  receiverName: string
  receiverEmail: string
  signatures: Signature[]
}

export default function SignContractPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const signingLink = params.signingLink as string

  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [signing, setSigning] = useState(false)
  const [signed, setSigned] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchContract()
    }
  }, [signingLink, status])

  const fetchContract = async () => {
    try {
      const response = await axios.get(`/api/sign/${signingLink}`)
      setContract(response.data.contract)

      const hasReceiverSigned = response.data.contract.signatures.some(
        (sig: any) => sig.type === 'RECEIVER'
      )
      setSigned(hasReceiverSigned)

      setLoading(false)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load contract')
      setLoading(false)
    }
  }

  const handleSignContract = () => {
    setShowSignatureModal(true)
  }

  const handleSignatureConfirm = async (signatureData: string) => {
    setSigning(true)
    try {
      await axios.post(`/api/sign/${signingLink}`, {
        signatureData,
      })

      setShowSignatureModal(false)
      setSigned(true)
      fetchContract()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save signature')
    } finally {
      setSigning(false)
    }
  }

  if (loading || status === 'loading') {
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
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Contract Not Found</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!contract) return null

  const hasInitiatorSigned = contract.signatures.some((sig) => sig.type === 'INITIATOR')
  const hasReceiverSigned = contract.signatures.some((sig) => sig.type === 'RECEIVER')
  const initiatorSignature = contract.signatures.find((sig) => sig.type === 'INITIATOR')
  const receiverSignature = contract.signatures.find((sig) => sig.type === 'RECEIVER')

  if (signed || contract.status === 'COMPLETED') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-green-600 mb-4">
            <CheckCircle className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Contract Signed!</h2>
          <p className="text-gray-600">
            You have successfully signed this contract. Both parties have now completed the signing
            process.
          </p>
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Contract:</strong> {contract.title}
            </p>
          </div>
          <button onClick={() => router.push('/dashboard')} className="btn-primary mt-6">
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <div className="text-center">
            <div className="mb-4">
              <span className="text-4xl">📝</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Lagos State Digital Signature Portal
            </h1>
            <p className="text-gray-600 mt-2">You have been invited to sign a contract</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-8">
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{contract.title}</h2>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">First Party</h3>
                <p className="text-gray-900">{contract.initiatorName}</p>
                {hasInitiatorSigned && (
                  <span className="inline-flex items-center text-xs text-green-700 bg-green-50 px-2 py-1 rounded mt-2">
                    <Check className="w-3 h-3 mr-1" /> Signed
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Second Party</h3>
                <p className="text-gray-900">{contract.receiverName}</p>
                <p className="text-sm text-gray-600">{contract.receiverEmail}</p>
                {hasReceiverSigned && (
                  <span className="inline-flex items-center text-xs text-green-700 bg-green-50 px-2 py-1 rounded mt-2">
                    <Check className="w-3 h-3 mr-1" /> Signed
                  </span>
                )}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Contract Terms</h3>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap font-serif text-gray-900 bg-gray-50 p-6 rounded-lg">
                  {contract.aiGeneratedContent || 'No content available.'}
                </div>
              </div>
            </div>

            {(hasInitiatorSigned || hasReceiverSigned) && (
              <div className="mb-8 space-y-6">
                <h3 className="text-sm font-semibold text-gray-700">Signatures</h3>
                <div className="grid grid-cols-2 gap-6">
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
                          Signed on {new Date(initiatorSignature.signedAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs font-medium text-gray-900">
                          {initiatorSignature.user.name || contract.initiatorName}
                        </p>
                      </div>
                    ) : (
                      <div className="h-24 flex items-center justify-center text-gray-400 text-sm border border-dashed rounded">
                        Awaiting signature
                      </div>
                    )}
                  </div>

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
                          Signed on {new Date(receiverSignature.signedAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs font-medium text-gray-900">
                          {receiverSignature.user.name || contract.receiverName}
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

            {!signed && contract.status !== 'COMPLETED' && (
              <>
                <div className="flex justify-center pt-6 border-t border-gray-200">
                  <LoadingButton
                    onClick={handleSignContract}
                    loading={signing}
                    loadingText="Signing..."
                    className="flex items-center gap-2 px-8 py-3 text-lg"
                    size="lg"
                  >
                    <FileSignature className="w-5 h-5" />
                    Sign Contract
                  </LoadingButton>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By signing this contract, you agree to all the terms and conditions stated above.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onConfirm={handleSignatureConfirm}
        signerName={contract.receiverName}
        loading={signing}
      />
    </div>
  )
}
