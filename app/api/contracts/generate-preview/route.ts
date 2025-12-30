import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { generateContractPDFWithRetry } from '@/lib/pdf-generator-new'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { contractId, content, title, category, createdAt } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Contract title and content are required' },
        { status: 400 }
      )
    }

    // Generate PDF preview
    const pdfBuffer = await generateContractPDFWithRetry({
      contractTitle: title,
      htmlContent: content,
      category,
      createdAt: createdAt ? new Date(createdAt) : undefined,
    })

    // Return PDF as a blob
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${title
          .replace(/[^a-z0-9]/gi, '-')
          .toLowerCase()}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF preview generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF preview' }, { status: 500 })
  }
}
