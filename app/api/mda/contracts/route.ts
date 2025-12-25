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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Validate pagination params
    const validPage = Math.max(1, page)
    const validLimit = Math.min(Math.max(1, limit), 100) // Max 100 items per page
    const skip = (validPage - 1) * validLimit

    // Build where clause
    const where: any = {}

    if (category && category !== 'ALL') {
      where.category = category
    }

    // Get total count for pagination
    const totalCount = await prisma.contract.count({ where })

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
      skip,
      take: validLimit,
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
      pagination: {
        page: validPage,
        limit: validLimit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / validLimit),
      },
    })
  } catch (error) {
    console.error('MDA contracts error:', error)
    return NextResponse.json({ error: 'Failed to fetch MDA contracts' }, { status: 500 })
  }
}
