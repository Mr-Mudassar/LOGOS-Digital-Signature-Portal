'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface PDFViewerSheetProps {
  isOpen: boolean
  onClose: () => void
  pdfUrl?: string | null
  contractId?: string
  contractTitle: string
  contractContent?: string
  category?: string
  createdAt?: string
}

export default function PDFViewerSheet({
  isOpen,
  onClose,
  pdfUrl,
  contractId,
  contractTitle,
  contractContent,
  category,
  createdAt,
}: PDFViewerSheetProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setPreviewUrl(null)
      setError('')
      return
    }

    // If we already have a PDF URL, use it
    if (pdfUrl) {
      setPreviewUrl(pdfUrl)
      return
    }

    // Otherwise, generate a preview PDF on-the-fly
    const generatePreview = async () => {
      if (!contractContent || !contractId) {
        setError('Contract content not available')
        return
      }

      setLoading(true)
      setError('')

      try {
        const response = await axios.post(
          '/api/contracts/generate-preview',
          {
            contractId,
            contractTitle,
            htmlContent: contractContent,
            category,
            createdAt,
          },
          {
            responseType: 'blob',
          }
        )

        // Create a blob URL for the PDF
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to generate PDF preview')
      } finally {
        setLoading(false)
      }
    }

    generatePreview()

    // Cleanup blob URL when component unmounts
    return () => {
      if (previewUrl && !pdfUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [isOpen, pdfUrl, contractId, contractTitle, contractContent, category, createdAt])

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-4xl p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>Contract PDF Preview</SheetTitle>
          <SheetDescription>{contractTitle}</SheetDescription>
        </SheetHeader>
        <div className="w-full h-[calc(100vh-80px)]">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Generating PDF preview...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            </div>
          )}
          {previewUrl && !loading && !error && (
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title={`PDF Viewer - ${contractTitle}`}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
