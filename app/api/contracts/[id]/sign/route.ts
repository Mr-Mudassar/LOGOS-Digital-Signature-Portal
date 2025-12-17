import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
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

    // Create signature with signer name and current date
    const signatureData = `${signerName} - ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`

    await prisma.signature.create({
      data: {
        contractId: id,
        userId: session.user.id,
        signatureData, // Store as "Name - Date" format
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

    await prisma.contract.update({
      where: { id },
      data: {
        status: newStatus,
        completedAt: newStatus === 'COMPLETED' ? new Date() : null,
      },
    })

    return NextResponse.json(
      { message: 'Signature saved successfully', status: newStatus },
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
