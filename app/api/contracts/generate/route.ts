import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Mock contract generator (fallback when OpenAI is not available)
function generateMockContract(
  title: string,
  initiatorName: string,
  receiverName: string,
  context?: string
): string {
  const today = new Date().toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `<h1>CONTRACT AGREEMENT</h1>
<h2>${title}</h2>
<p>This Agreement is made and entered into on <strong>${today}</strong>,</p>

<h3>BETWEEN:</h3>

<p><strong>FIRST PARTY (Initiator):</strong> ${initiatorName}<br />
(Hereinafter referred to as "the First Party")</p>

<p><strong>AND</strong></p>

<p><strong>SECOND PARTY (Receiver):</strong> ${receiverName}<br />
(Hereinafter referred to as "the Second Party")</p>

<p>WHEREAS the parties wish to enter into this agreement under the following terms and conditions:</p>

<h3>1. PURPOSE</h3>
<p>${context || 'This contract defines the terms and conditions agreed upon by both parties.'}</p>

<h3>2. TERMS AND CONDITIONS</h3>
<ul>
  <li>2.1. Both parties agree to fulfill their obligations as outlined in this agreement.</li>
  <li>2.2. This agreement shall be governed by the laws of Lagos State, Nigeria.</li>
  <li>2.3. Any disputes arising from this agreement shall be resolved through mediation or arbitration.</li>
</ul>

<h3>3. DURATION</h3>
<p>This agreement shall commence on the date of signing and shall remain in effect until the obligations are fulfilled or as otherwise agreed by both parties.</p>

<h3>4. OBLIGATIONS</h3>
<ul>
  <li>4.1. The First Party agrees to perform their duties as specified.</li>
  <li>4.2. The Second Party agrees to perform their duties as specified.</li>
</ul>

<h3>5. CONFIDENTIALITY</h3>
<p>Both parties agree to maintain confidentiality regarding any sensitive information shared during the course of this agreement.</p>

<h3>6. TERMINATION</h3>
<p>Either party may terminate this agreement by providing written notice to the other party, subject to any applicable terms.</p>

<h3>7. SIGNATURES</h3>
<p>By signing below, both parties acknowledge that they have read, understood, and agree to be bound by the terms of this agreement.</p>

<p><em>[NOTE: This contract was generated using a template. For legal matters, please consult with a qualified attorney.]</em></p>
`
}

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
      // Fallback: Generate a basic contract template
      aiGeneratedContent = generateMockContract(
        contract.title,
        initiatorName,
        receiverName,
        userContext
      )
    } else {
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
      } catch (openaiError: any) {
        console.error('OpenAI API error:', openaiError.message)
        // Fallback to mock contract if OpenAI fails
        aiGeneratedContent = generateMockContract(
          contract.title,
          initiatorName,
          receiverName,
          userContext
        )
      }
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
