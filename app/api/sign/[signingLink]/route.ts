import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendContractCompletion } from '@/lib/email'

// GET - Fetch contract by signing link (public)
export async function GET(request: NextRequest, { params }: { params: { signingLink: string } }) {
  try {
    const { signingLink } = params

    const contract = await prisma.contract.findUnique({
      where: { signingLink },
      include: {
        initiator: {
          select: {
            id: true,
            name: true,
          },
        },
        signatures: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Check if signing link is expired
    if (contract.signingLinkExpiresAt && contract.signingLinkExpiresAt < new Date()) {
      return NextResponse.json({ error: 'Signing link has expired' }, { status: 410 })
    }

    return NextResponse.json({ contract }, { status: 200 })
  } catch (error) {
    console.error('Get contract by signing link error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching the contract' },
      { status: 500 }
    )
  }
}

// POST - Sign contract via public link
export async function POST(request: NextRequest, { params }: { params: { signingLink: string } }) {
  try {
    const { signingLink } = params
    const body = await request.json()
    const { signatureData } = body

    if (!signatureData) {
      return NextResponse.json({ error: 'Signature data is required' }, { status: 400 })
    }

    // Fetch contract
    const contract = await prisma.contract.findUnique({
      where: { signingLink },
      include: {
        signatures: true,
      },
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Check if signing link is expired
    if (contract.signingLinkExpiresAt && contract.signingLinkExpiresAt < new Date()) {
      return NextResponse.json({ error: 'Signing link has expired' }, { status: 410 })
    }

    // Check if receiver already signed
    const hasReceiverSigned = contract.signatures.some((sig) => sig.type === 'RECEIVER')

    if (hasReceiverSigned) {
      return NextResponse.json({ error: 'This contract has already been signed' }, { status: 400 })
    }

    // Create or find receiver user account
    let receiverUser = await prisma.user.findUnique({
      where: { email: contract.receiverEmail },
    })

    if (!receiverUser) {
      // Create a temporary user account for the receiver
      receiverUser = await prisma.user.create({
        data: {
          email: contract.receiverEmail,
          name: contract.receiverName || 'Unknown',
          password: '', // No password for auto-created users
        },
      })
    }

    // Update contract with receiver ID if not set
    if (!contract.receiverId) {
      await prisma.contract.update({
        where: { id: contract.id },
        data: { receiverId: receiverUser.id },
      })
    }

    // Create signature
    await prisma.signature.create({
      data: {
        contractId: contract.id,
        userId: receiverUser.id,
        signatureData,
        type: 'RECEIVER',
      },
    })

    // Update contract status to COMPLETED
    await prisma.contract.update({
      where: { id: contract.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    })

    // Send completion email to both parties
    const initiator = await prisma.user.findUnique({
      where: { id: contract.initiatorId },
    })

    if (initiator) {
      await sendContractCompletion({
        initiatorEmail: initiator.email,
        receiverEmail: contract.receiverEmail,
        initiatorName: initiator.name || contract.initiatorName || 'Unknown',
        receiverName: contract.receiverName || 'Unknown',
        contractTitle: contract.title,
      })
    }

    return NextResponse.json(
      { message: 'Contract signed successfully', status: 'COMPLETED' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Sign contract via link error:', error)
    return NextResponse.json(
      { error: 'An error occurred while signing the contract' },
      { status: 500 }
    )
  }
}
