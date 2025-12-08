import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

interface GeneratePdfOptions {
  content: string
  title: string
  initiatorName: string
  receiverName: string
  initiatorSignature?: string // Base64 image
  receiverSignature?: string // Base64 image
}

/**
 * Generate a PDF from text content with optional signatures
 */
export async function generateContractPdf(options: GeneratePdfOptions): Promise<Uint8Array> {
  const { content, title, initiatorName, receiverName, initiatorSignature, receiverSignature } =
    options

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create()

  // Embed fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Page settings
  const pageWidth = 595.28 // A4 width in points
  const pageHeight = 841.89 // A4 height in points
  const margin = 50
  const contentWidth = pageWidth - 2 * margin

  // Add first page
  let page = pdfDoc.addPage([pageWidth, pageHeight])
  let yPosition = pageHeight - margin

  // Add title
  const titleSize = 16
  page.drawText(title, {
    x: margin,
    y: yPosition,
    size: titleSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  })

  yPosition -= titleSize + 20

  // Add a line under the title
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: pageWidth - margin, y: yPosition },
    thickness: 1,
    color: rgb(0.5, 0.5, 0.5),
  })

  yPosition -= 30

  // Split content into lines and pages
  const fontSize = 11
  const lineHeight = fontSize + 4
  const lines = content.split('\n')

  for (const line of lines) {
    // Wrap long lines
    const words = line.split(' ')
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine + word + ' '
      const textWidth = font.widthOfTextAtSize(testLine, fontSize)

      if (textWidth > contentWidth && currentLine !== '') {
        // Draw current line
        if (yPosition < margin + 100) {
          // Need a new page
          page = pdfDoc.addPage([pageWidth, pageHeight])
          yPosition = pageHeight - margin
        }

        page.drawText(currentLine.trim(), {
          x: margin,
          y: yPosition,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        })

        yPosition -= lineHeight
        currentLine = word + ' '
      } else {
        currentLine = testLine
      }
    }

    // Draw remaining text
    if (currentLine.trim() !== '') {
      if (yPosition < margin + 100) {
        page = pdfDoc.addPage([pageWidth, pageHeight])
        yPosition = pageHeight - margin
      }

      page.drawText(currentLine.trim(), {
        x: margin,
        y: yPosition,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      })
    }

    yPosition -= lineHeight
  }

  // Ensure we have space for signatures
  if (yPosition < margin + 150) {
    page = pdfDoc.addPage([pageWidth, pageHeight])
    yPosition = pageHeight - margin
  } else {
    yPosition -= 30
  }

  // Add signature section
  const signatureY = 150 // Fixed position from bottom

  // Initiator signature (bottom left)
  const initiatorX = margin
  page.drawText('First Party (Initiator):', {
    x: initiatorX,
    y: signatureY + 40,
    size: 10,
    font: boldFont,
    color: rgb(0, 0, 0),
  })

  if (initiatorSignature) {
    try {
      // Remove data URL prefix if present
      const base64Data = initiatorSignature.replace(/^data:image\/\w+;base64,/, '')
      const signatureImage = await pdfDoc.embedPng(base64Data)

      const signatureWidth = 150
      const signatureHeight = 50

      page.drawImage(signatureImage, {
        x: initiatorX,
        y: signatureY - 20,
        width: signatureWidth,
        height: signatureHeight,
      })
    } catch (error) {
      console.error('Error embedding initiator signature:', error)
    }
  }

  page.drawLine({
    start: { x: initiatorX, y: signatureY - 25 },
    end: { x: initiatorX + 150, y: signatureY - 25 },
    thickness: 1,
    color: rgb(0, 0, 0),
  })

  page.drawText(initiatorName, {
    x: initiatorX,
    y: signatureY - 40,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  })

  // Receiver signature (bottom right)
  const receiverX = pageWidth - margin - 150
  page.drawText('Second Party (Receiver):', {
    x: receiverX,
    y: signatureY + 40,
    size: 10,
    font: boldFont,
    color: rgb(0, 0, 0),
  })

  if (receiverSignature) {
    try {
      const base64Data = receiverSignature.replace(/^data:image\/\w+;base64,/, '')
      const signatureImage = await pdfDoc.embedPng(base64Data)

      const signatureWidth = 150
      const signatureHeight = 50

      page.drawImage(signatureImage, {
        x: receiverX,
        y: signatureY - 20,
        width: signatureWidth,
        height: signatureHeight,
      })
    } catch (error) {
      console.error('Error embedding receiver signature:', error)
    }
  }

  page.drawLine({
    start: { x: receiverX, y: signatureY - 25 },
    end: { x: receiverX + 150, y: signatureY - 25 },
    thickness: 1,
    color: rgb(0, 0, 0),
  })

  page.drawText(receiverName, {
    x: receiverX,
    y: signatureY - 40,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  })

  // Generate and return PDF bytes
  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}

/**
 * Convert PDF bytes to base64 data URL for display
 */
export function pdfBytesToDataUrl(pdfBytes: Uint8Array): string {
  const base64 = Buffer.from(pdfBytes).toString('base64')
  return `data:application/pdf;base64,${base64}`
}
