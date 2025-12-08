import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch a single contract
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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
          orderBy: {
            signedAt: 'asc',
          },
        },
      },
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Get current user's email
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has access to this contract (by ID or email)
    const isInitiator = contract.initiatorId === session.user.id
    const isReceiver =
      contract.receiverId === session.user.id || contract.receiverEmail === user.email

    if (!isInitiator && !isReceiver) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ contract }, { status: 200 })
  } catch (error) {
    console.error('Get contract error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching the contract' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a contract
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Only initiator can delete
    if (contract.initiatorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Can't delete if already sent
    if (contract.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Cannot delete contract that has been sent' },
        { status: 400 }
      )
    }

    await prisma.contract.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Contract deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Delete contract error:', error)
    return NextResponse.json(
      { error: 'An error occurred while deleting the contract' },
      { status: 500 }
    )
  }
}

// PATCH - Update contract content
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Only initiator can edit
    if (contract.initiatorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Can't edit if already signed
    const hasSignatures = await prisma.signature.findFirst({
      where: { contractId: params.id },
    })

    if (hasSignatures) {
      return NextResponse.json(
        { error: 'Cannot edit contract that has been signed' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { aiGeneratedContent } = body

    const updatedContract = await prisma.contract.update({
      where: { id: params.id },
      data: { aiGeneratedContent },
    })

    return NextResponse.json({ contract: updatedContract }, { status: 200 })
  } catch (error) {
    console.error('Update contract error:', error)
    return NextResponse.json(
      { error: 'An error occurred while updating the contract' },
      { status: 500 }
    )
  }
}
