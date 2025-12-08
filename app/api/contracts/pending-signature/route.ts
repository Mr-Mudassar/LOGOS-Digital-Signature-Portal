import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user's email
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get contracts where:
    // 1. Current user is the receiver (by email OR receiverId)
    // 2. Status is AWAITING_SIGNATURE (contract has been sent via email)
    // 3. Receiver hasn't signed yet
    const contracts = await prisma.contract.findMany({
      where: {
        OR: [{ receiverId: session.user.id }, { receiverEmail: user.email }],
        status: 'AWAITING_SIGNATURE',
        signatures: {
          none: {
            type: 'RECEIVER',
          },
        },
      },
      include: {
        initiator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        signatures: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ contracts })
  } catch (error) {
    console.error('Error fetching pending signature contracts:', error)
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 })
  }
}
