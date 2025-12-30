import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

const createContractSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  initiatorName: z.string().min(1, 'Initiator name is required'),
  initiatorEmail: z.string().email().optional(),
  receiverName: z.string().optional(), // Made optional - will be captured when receiver signs up
  receiverEmail: z.string().email('Valid receiver email is required'),
  userContext: z.string().optional(),
  category: z
    .enum(['HOUSING', 'LAND', 'CIVIL_SERVICE_COMMISSION', 'MINISTRY_OF_JUSTICE', 'OTHER'])
    .optional(),
  referenceDocumentUrl: z.string().optional(),
  referenceDocumentName: z.string().optional(),
})

// GET - Fetch all contracts for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Validate pagination params
    const validPage = Math.max(1, page)
    const validLimit = Math.min(Math.max(1, limit), 100) // Max 100 items per page
    const skip = (validPage - 1) * validLimit

    const where: any = {
      OR: [{ initiatorId: session.user.id }, { receiverId: session.user.id }],
    }

    if (status) {
      where.status = status
    }

    // Get total count for pagination
    const totalCount = await prisma.contract.count({ where })

    const contracts = await prisma.contract.findMany({
      where,
      include: {
        initiator: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        signatures: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
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

    return NextResponse.json(
      {
        contracts,
        pagination: {
          page: validPage,
          limit: validLimit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / validLimit),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get contracts error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching contracts' },
      { status: 500 }
    )
  }
}

// POST - Create a new contract
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createContractSchema.parse(body)

    // Generate unique signing link
    const signingLink = nanoid(32)

    // Create contract
    const contract = await prisma.contract.create({
      data: {
        title: data.title,
        initiatorId: session.user.id,
        initiatorName: data.initiatorName,
        initiatorEmail: data.initiatorEmail || session.user.email,
        receiverName: data.receiverName || 'To be determined',
        receiverEmail: data.receiverEmail,
        userContext: data.userContext,
        category: data.category || 'OTHER',
        referenceDocumentUrl: data.referenceDocumentUrl,
        referenceDocumentName: data.referenceDocumentName,
        signingLink,
        signingLinkExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        status: 'DRAFT',
      },
      include: {
        initiator: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(
      { message: 'Contract created successfully', contract },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create contract error:', error)
    return NextResponse.json(
      { error: 'An error occurred while creating the contract' },
      { status: 500 }
    )
  }
}
