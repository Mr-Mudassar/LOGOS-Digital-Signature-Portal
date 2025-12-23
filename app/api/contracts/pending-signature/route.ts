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

    // Get pagination params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Validate pagination params
    const validPage = Math.max(1, page)
    const validLimit = Math.min(Math.max(1, limit), 100)
    const skip = (validPage - 1) * validLimit

    // Get current user's email
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build where clause
    const where = {
      OR: [{ receiverId: session.user.id }, { receiverEmail: user.email }],
      status: 'AWAITING_SIGNATURE' as const,
      signatures: {
        none: {
          type: 'RECEIVER' as const,
        },
      },
    }

    // Get total count
    const totalCount = await prisma.contract.count({ where })

    // Get contracts where:
    // 1. Current user is the receiver (by email OR receiverId)
    // 2. Status is AWAITING_SIGNATURE (contract has been sent via email)
    // 3. Receiver hasn't signed yet
    const contracts = await prisma.contract.findMany({
      where,
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
      skip,
      take: validLimit,
    })

    return NextResponse.json({
      contracts,
      pagination: {
        page: validPage,
        limit: validLimit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / validLimit),
      },
    })
  } catch (error) {
    console.error('Error fetching pending signature contracts:', error)
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 })
  }
}
