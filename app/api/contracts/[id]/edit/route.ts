import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Get the contract and verify ownership
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        signatures: true,
      },
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Only the initiator can edit
    if (contract.initiatorId !== session.user.id) {
      return NextResponse.json({ error: 'Only the contract creator can edit' }, { status: 403 })
    }

    // Check if any signatures exist - if yes, prevent editing
    if (contract.signatures.length > 0) {
      return NextResponse.json(
        { error: 'Cannot edit contract after it has been signed' },
        { status: 403 }
      )
    }

    // Update the contract content
    const updatedContract = await prisma.contract.update({
      where: { id },
      data: {
        aiGeneratedContent: content,
      },
    })

    return NextResponse.json(
      {
        message: 'Contract updated successfully',
        contract: updatedContract,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Edit contract error:', error)
    return NextResponse.json(
      { error: 'An error occurred while updating the contract' },
      { status: 500 }
    )
  }
}
