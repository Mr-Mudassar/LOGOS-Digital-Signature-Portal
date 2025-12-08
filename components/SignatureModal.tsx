'use client'

import { useRef, useState, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface SignatureModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (signatureData: string) => void
  signerName: string
  loading?: boolean
}

export default function SignatureModal({
  isOpen,
  onClose,
  onConfirm,
  signerName,
  loading = false,
}: SignatureModalProps) {
  const sigCanvas = useRef<SignatureCanvas>(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 200 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth
      setCanvasSize({ width, height: 200 })
    }
  }, [isOpen])

  const handleClear = () => {
    sigCanvas.current?.clear()
    setIsEmpty(true)
  }

  const handleConfirm = () => {
    if (sigCanvas.current && !isEmpty) {
      const signatureData = sigCanvas.current.toDataURL('image/png')
      onConfirm(signatureData)
      onClose()
    }
  }

  const handleBegin = () => {
    setIsEmpty(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sign Contract</DialogTitle>
          <DialogDescription>{signerName}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-600 mb-4">
            Please draw your signature in the box below. Your signature will be embedded in the
            contract document.
          </p>

          {/* Signature Canvas */}
          <div
            ref={containerRef}
            className="border-2 border-gray-300 rounded-lg bg-white overflow-hidden"
          >
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                width: canvasSize.width,
                height: canvasSize.height,
                className: 'cursor-crosshair',
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

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button onClick={handleClear} variant="outline" type="button" disabled={loading}>
            Clear
          </Button>
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" type="button" disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={isEmpty || loading} type="button">
              {loading && (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {loading ? 'Confirming...' : 'Confirm Signature'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
