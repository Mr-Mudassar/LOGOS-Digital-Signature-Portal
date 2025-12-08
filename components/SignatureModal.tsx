'use client'

import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import SignatureCanvas from 'react-signature-canvas'
import { X } from 'lucide-react'

interface SignatureModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (signatureData: string) => void
  signerName: string
}

export default function SignatureModal({
  isOpen,
  onClose,
  onConfirm,
  signerName,
}: SignatureModalProps) {
  const sigCanvas = useRef<SignatureCanvas>(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  const handleClear = () => {
    sigCanvas.current?.clear()
    setIsEmpty(true)
  }

  const handleConfirm = () => {
    if (sigCanvas.current && !isEmpty) {
      const signatureData = sigCanvas.current.toDataURL('image/png')
      onConfirm(signatureData)
    }
  }

  const handleBegin = () => {
    setIsEmpty(false)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Sign Contract</h2>
            <p className="text-sm text-gray-600 mt-1">{signerName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Please draw your signature in the box below. Your signature will be embedded in the
            contract document.
          </p>

          {/* Signature Canvas */}
          <div className="border-2 border-gray-300 rounded-lg bg-white">
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                className: 'w-full h-48 cursor-crosshair',
                style: { touchAction: 'none' },
              }}
              backgroundColor="white"
              onBegin={handleBegin}
            />
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Use your mouse, trackpad, or touchscreen to draw your signature
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-3 p-6 pt-0">
          <button onClick={handleClear} className="btn-secondary" type="button">
            Clear
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary" type="button">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="btn-primary"
              disabled={isEmpty}
              type="button"
            >
              Confirm Signature
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
