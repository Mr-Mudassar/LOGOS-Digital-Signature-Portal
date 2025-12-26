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

    // Get status filter and pagination params from query
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Validate pagination params
    const validPage = Math.max(1, page)
    const validLimit = Math.min(Math.max(1, limit), 100) // Max 100 items per page
    const skip = (validPage - 1) * validLimit

    // Build where clause
    const where: any = {}
    if (status) {
      where.status = status
    }

    // Get total count for pagination
    const totalCount = await prisma.contract.count({ where })

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
        pdfUrl: true,
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
    console.error('Admin contracts error:', error)
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 })
  }
}
