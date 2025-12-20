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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get status filter from query params
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    // Build where clause
    const where: any = {}
    if (status) {
      where.status = status
    }

    // Get all contracts with initiator and receiver info
    const contracts = await prisma.contract.findMany({
      where,
      select: {
        id: true,
        title: true,
        status: true,
        category: true,
        createdAt: true,
        receiverName: true,
        receiverEmail: true,
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ contracts })
  } catch (error) {
    console.error('Admin contracts error:', error)
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 })
  }
}
