import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const contractId = formData.get('contractId') as string
    const userContext = formData.get('userContext') as string
    const initiatorName = formData.get('initiatorName') as string
    const receiverName = formData.get('receiverName') as string
    const referenceDocument = formData.get('referenceDocument') as File | null

    if (!contractId) {
      return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 })
    }

    // Verify the contract belongs to the user
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
    })

    if (!contract || contract.initiatorId !== session.user.id) {
      return NextResponse.json({ error: 'Contract not found or unauthorized' }, { status: 404 })
    }

    // Extract text from reference document if provided
    let documentText = ''
    if (referenceDocument) {
      // For now, we'll create a simple text extraction
      // In production, you would use a library like pdf-parse or mammoth for proper extraction
      const buffer = await referenceDocument.arrayBuffer()
      const text = new TextDecoder().decode(buffer)

      // Basic extraction - take first 2000 chars as context
      documentText = text.substring(0, 2000)
    }

    // Generate contract using OpenAI
    let aiGeneratedContent: string | null = null

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === '') {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please contact the administrator.' },
        { status: 500 }
      )
    }

    try {
      const prompt = `You are a legal document generator for Lagos State, Nigeria. Generate a professional legal contract based on the following information:

Contract Title: ${contract.title}
First Party (Initiator): ${initiatorName}
Second Party (Receiver): ${receiverName}

${userContext ? `Additional Context: ${userContext}` : ''}

${documentText ? `Reference Document Content:\n${documentText}` : ''}

Generate a complete, legally-sound contract that:
1. Includes proper legal language appropriate for Lagos State, Nigeria
2. Has clear sections for terms and conditions
3. Includes spaces for signatures at the bottom
4. Follows standard contract formatting
5. Is professional and comprehensive

IMPORTANT: Format the contract in clean HTML with proper semantic tags (h1, h2, h3, p, ul, li, strong, em). 
Use headings for sections, paragraphs for content, and lists where appropriate.
Do NOT include DOCTYPE, html, head, or body tags - only the content HTML.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using gpt-4o-mini - available for all API keys
        messages: [
          {
            role: 'system',
            content:
              'You are an expert legal document generator specializing in Nigerian contract law. Generate professional, legally-sound contracts.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2500,
      })

      aiGeneratedContent = completion.choices[0].message.content

      if (!aiGeneratedContent) {
        return NextResponse.json(
          { error: 'Failed to generate contract content. Please try again.' },
          { status: 500 }
        )
      }
    } catch (openaiError: any) {
      console.error('OpenAI API error:', openaiError)

      // Return specific error messages based on the error type
      if (openaiError.status === 401) {
        return NextResponse.json(
          { error: 'Invalid OpenAI API key. Please contact the administrator.' },
          { status: 500 }
        )
      }

      if (openaiError.status === 429) {
        return NextResponse.json(
          { error: 'OpenAI API rate limit exceeded. Please try again in a few moments.' },
          { status: 429 }
        )
      }

      if (openaiError.code === 'insufficient_quota') {
        return NextResponse.json(
          { error: 'OpenAI API quota exceeded. Please contact the administrator.' },
          { status: 402 }
        )
      }

      return NextResponse.json(
        { error: `Failed to generate contract: ${openaiError.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Update the contract with the AI-generated content
    const updatedContract = await prisma.contract.update({
      where: { id: contractId },
      data: {
        aiGeneratedContent,
      },
    })

    return NextResponse.json(
      {
        message: 'Contract generated successfully',
        contract: updatedContract,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Generate contract error:', error)

    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'OpenAI API quota exceeded. Please check your API key and billing.' },
        { status: 402 }
      )
    }

    return NextResponse.json(
      { error: 'An error occurred while generating the contract' },
      { status: 500 }
    )
  }
}
