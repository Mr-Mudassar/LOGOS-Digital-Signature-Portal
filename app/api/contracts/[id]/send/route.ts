import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendContractInvitation } from '@/lib/email'

// POST - Send contract to receiver
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: {
        initiator: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Only initiator can send
    if (contract.initiatorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update contract status
    const updatedContract = await prisma.contract.update({
      where: { id: params.id },
      data: {
        status: 'AWAITING_SIGNATURE',
      },
    })

    // Send email to receiver
    await sendContractInvitation({
      receiverEmail: contract.receiverEmail,
      receiverName: contract.receiverName,
      initiatorName: contract.initiatorName,
      contractTitle: contract.title,
      signingLink: contract.signingLink || '',
    })

    return NextResponse.json(
      { message: 'Contract sent successfully', contract: updatedContract },
      { status: 200 }
    )
  } catch (error) {
    console.error('Send contract error:', error)
    return NextResponse.json(
      { error: 'An error occurred while sending the contract' },
      { status: 500 }
    )
  }
}
