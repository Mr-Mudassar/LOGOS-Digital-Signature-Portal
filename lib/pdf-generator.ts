import puppeteer from 'puppeteer'

export interface PDFGenerationOptions {
  contractTitle: string
  htmlContent: string
  category?: string
  createdAt?: Date
}

export async function generateContractPDF(options: PDFGenerationOptions): Promise<Buffer> {
  const { contractTitle, htmlContent, category, createdAt } = options

  let browser = null

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    })

    const page = await browser.newPage()

    // Create full HTML document with styling
    const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${contractTitle}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      padding: 40px 60px;
      max-width: 210mm;
      margin: 0 auto;
    }
    
    h1, h2, h3, h4, h5, h6 {
      margin-top: 20px;
      margin-bottom: 10px;
      font-weight: bold;
      color: #000;
    }
    
    h1 {
      font-size: 24pt;
      text-align: center;
      margin-bottom: 20px;
      text-transform: uppercase;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
    }
    
    h2 {
      font-size: 18pt;
      margin-top: 30px;
    }
    
    h3 {
      font-size: 14pt;
      margin-top: 20px;
    }
    
    p {
      margin-bottom: 12px;
      text-align: justify;
    }
    
    ul, ol {
      margin: 10px 0 10px 30px;
    }
    
    li {
      margin-bottom: 6px;
    }
    
    strong {
      font-weight: bold;
    }
    
    em {
      font-style: italic;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #ccc;
    }
    
    .header h1 {
      border: none;
      padding: 0;
    }
    
    .metadata {
      font-size: 10pt;
      color: #666;
      margin-top: 10px;
    }
    
    .signature-section {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #333;
      page-break-inside: avoid;
    }
    
    .signature-section h3 {
      text-align: center;
      margin-bottom: 30px;
      font-size: 16pt;
    }
    
    .signature-container {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
    }
    
    .signature-block {
      flex: 1;
      padding: 0 20px;
    }
    
    .signature-block p {
      margin: 5px 0;
      text-align: left;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      .signature-section {
        page-break-before: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${contractTitle}</h1>
    ${
      category || createdAt
        ? `
      <div class="metadata">
        ${category ? `<div>Category: ${category}</div>` : ''}
        ${createdAt ? `<div>Date: ${new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>` : ''}
      </div>
    `
        : ''
    }
  </div>
  
  <div class="content">
    ${htmlContent}
  </div>
</body>
</html>
    `

    await page.setContent(fullHTML, {
      waitUntil: 'networkidle0',
    })

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    })

    return Buffer.from(pdfBuffer)
  } catch (error) {
    console.error('PDF generation error:', error)
    throw new Error(
      `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

export async function generateContractPDFWithRetry(
  options: PDFGenerationOptions,
  maxRetries: number = 3
): Promise<Buffer> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await generateContractPDF(options)
    } catch (error) {
      lastError = error as Error
      console.error(`PDF generation attempt ${attempt} failed:`, error)

      if (attempt < maxRetries) {
        // Exponential backoff: 2s, 4s, 8s
        const delay = Math.pow(2, attempt) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw new Error(
    `Failed to generate PDF after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`
  )
}
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
