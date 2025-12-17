import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get category from query params (optional)
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // Build where clause
    const where: any = {}

    if (category && category !== 'ALL') {
      where.category = category
    }

    // Fetch contracts
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
    })

    // Get contract counts by category
    const categoryCounts = await prisma.contract.groupBy({
      by: ['category'],
      _count: true,
    })

    const counts = categoryCounts.reduce((acc, item) => {
      acc[item.category] = item._count
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      contracts,
      counts,
    })
  } catch (error) {
    console.error('MDA contracts error:', error)
    return NextResponse.json({ error: 'Failed to fetch MDA contracts' }, { status: 500 })
  }
}
