'use client'

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
  pdfUrl: string
  contractTitle: string
}

export default function PDFViewerSheet({
  isOpen,
  onClose,
  pdfUrl,
  contractTitle,
}: PDFViewerSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-4xl p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>Contract PDF</SheetTitle>
          <SheetDescription>{contractTitle}</SheetDescription>
        </SheetHeader>
        <div className="w-full h-[calc(100vh-80px)]">
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title={`PDF Viewer - ${contractTitle}`}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
