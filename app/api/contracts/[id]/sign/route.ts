import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateContractPDFWithRetry } from '@/lib/pdf-generator-new'
import { uploadToS3WithRetry } from '@/lib/s3-upload'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { signerName, signerType } = body

    if (!signerName || !signerType) {
      return NextResponse.json(
        { error: 'Signer name and signer type are required' },
        { status: 400 }
      )
    }

    // Map signerType to SignatureType enum
    const type = signerType === 'initiator' ? 'INITIATOR' : 'RECEIVER'

    // Verify the contract exists and user has access
    const contract = await prisma.contract.findUnique({
      where: { id },
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Verify user is authorized to sign
    if (signerType === 'initiator' && contract.initiatorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (signerType === 'receiver') {
      // Get current user's email
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true },
      })

      // Check if user is the receiver (by ID or email)
      const isReceiverById = contract.receiverId === session.user.id
      const isReceiverByEmail = user && contract.receiverEmail === user.email

      if (!isReceiverById && !isReceiverByEmail) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }

      // Update contract with receiverId if not set
      if (!contract.receiverId) {
        await prisma.contract.update({
          where: { id },
          data: { receiverId: session.user.id },
        })
      }
    }

    // Check if user already signed
    const existingSignature = await prisma.signature.findFirst({
      where: {
        contractId: id,
        userId: session.user.id,
        type,
      },
    })

    if (existingSignature) {
      return NextResponse.json({ error: 'You have already signed this contract' }, { status: 400 })
    }

    // Format date and time
    const signedDate = new Date()
    const formattedDate = signedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const formattedTime = signedDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
    const formattedDateTime = `${formattedDate} at ${formattedTime}`

    const signatureData = `${signerName} - ${formattedDateTime}`

    // Replace placeholders in contract content with bold text
    let updatedContent = contract.aiGeneratedContent || ''
    if (signerType === 'initiator') {
      updatedContent = updatedContent
        .replace(/\{\{INITIATOR_NAME\}\}/g, `<strong>${signerName}</strong>`)
        .replace(/\{\{INITIATOR_DATE\}\}/g, `<strong>${formattedDateTime}</strong>`)
    } else {
      updatedContent = updatedContent
        .replace(/\{\{RECEIVER_NAME\}\}/g, `<strong>${signerName}</strong>`)
        .replace(/\{\{RECEIVER_DATE\}\}/g, `<strong>${formattedDateTime}</strong>`)
    }

    // Update contract with replaced placeholders
    await prisma.contract.update({
      where: { id },
      data: {
        aiGeneratedContent: updatedContent,
      },
    })

    await prisma.signature.create({
      data: {
        contractId: id,
        userId: session.user.id,
        signatureData,
        type,
      },
    })

    // Check if both parties have signed
    const signatures = await prisma.signature.findMany({
      where: { contractId: id },
    })

    const hasInitiatorSigned = signatures.some((sig) => sig.type === 'INITIATOR')
    const hasReceiverSigned = signatures.some((sig) => sig.type === 'RECEIVER')

    // Update contract status
    let newStatus = contract.status
    if (signerType === 'initiator' && !hasReceiverSigned) {
      newStatus = 'DRAFT' // Initiator signed, waiting to send to receiver
    } else if (hasInitiatorSigned && hasReceiverSigned) {
      newStatus = 'COMPLETED'
    }

    const updatedContract = await prisma.contract.update({
      where: { id },
      data: {
        status: newStatus,
        completedAt: newStatus === 'COMPLETED' ? new Date() : null,
      },
    })

    // Generate PDF and upload to S3 when contract is completed
    let pdfUrl: string | null = null
    if (newStatus === 'COMPLETED' && updatedContent) {
      try {
        console.log(`Generating PDF for completed contract: ${id}`)

        // Generate PDF with retry logic
        const pdfBuffer = await generateContractPDFWithRetry({
          contractTitle: contract.title,
          htmlContent: updatedContent,
          category: contract.category,
          createdAt: contract.createdAt,
        })

        console.log(`PDF generated successfully for contract: ${id}`)

        // Sanitize filename
        const sanitizedTitle = contract.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()
        const fileName = `${sanitizedTitle}-${Date.now()}.pdf`

        // Upload to S3 with retry logic
        pdfUrl = await uploadToS3WithRetry(pdfBuffer, fileName, 'application/pdf')

        console.log(`PDF uploaded to S3: ${pdfUrl}`)

        // Update contract with PDF URL
        await prisma.contract.update({
          where: { id },
          data: { pdfUrl },
        })
      } catch (error) {
        console.error('PDF generation or upload failed:', error)
        // Don't fail the signing process if PDF generation fails
        // The PDF can be regenerated later if needed
      }
    }

    return NextResponse.json(
      {
        message: 'Signature saved successfully',
        status: newStatus,
        pdfUrl: pdfUrl || undefined,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Sign contract error:', error)
    return NextResponse.json(
      { error: 'An error occurred while saving the signature' },
      { status: 500 }
    )
  }
}
