import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
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

    // Get total contracts (all contracts regardless of status)
    const totalContracts = await prisma.contract.count()

    // Get total draft contracts
    const totalDrafts = await prisma.contract.count({
      where: {
        status: 'DRAFT',
      },
    })

    // Get total pending signatures (contracts awaiting signature)
    const totalPendingSignatures = await prisma.contract.count({
      where: {
        status: 'AWAITING_SIGNATURE',
      },
    })

    // Get total completed contracts in last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const completedLast30Days = await prisma.contract.count({
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: thirtyDaysAgo,
        },
      },
    })

    // Static values as per requirement
    const verifiedDocuments = 0
    const suspiciousEvents = 0

    return NextResponse.json({
      totalContracts,
      totalDrafts,
      totalPendingSignatures,
      completedLast30Days,
      verifiedDocuments,
      suspiciousEvents,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch admin statistics' }, { status: 500 })
  }
}
