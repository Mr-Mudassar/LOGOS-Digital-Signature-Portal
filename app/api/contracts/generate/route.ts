import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import mammoth from 'mammoth'

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

    // Extract text from reference document if provided (DOCX only)
    let documentText = ''
    if (referenceDocument) {
      // Validate file type - only accept DOCX
      if (!referenceDocument.name.toLowerCase().endsWith('.docx')) {
        return NextResponse.json(
          { error: 'Only DOCX files are supported for reference documents' },
          { status: 400 }
        )
      }

      try {
        // Extract text from DOCX using mammoth
        const buffer = await referenceDocument.arrayBuffer()
        const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) })
        documentText = result.value

        // Limit to reasonable context size (10000 chars)
        if (documentText.length > 10000) {
          documentText = documentText.substring(0, 10000)
        }
      } catch (error) {
        console.error('Error extracting DOCX content:', error)
        return NextResponse.json(
          { error: 'Failed to extract text from DOCX file. Please ensure the file is valid.' },
          { status: 400 }
        )
      }
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
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      const prompt = `You are a legal document generator for Lagos State, Nigeria. Generate a professional legal contract based on the following information:

Contract Title: ${contract.title}
First Party (Initiator): ${initiatorName}
Second Party (Receiver): ${receiverName}
Current Date: ${currentDate}

${userContext ? `Additional Context: ${userContext}` : ''}

${documentText ? `Reference Document Content:\n${documentText}` : ''}

Generate a complete, legally-sound contract that:
1. Includes proper legal language appropriate for Lagos State, Nigeria
2. Has clear sections for terms and conditions
3. Follows standard contract formatting
4. Is professional and comprehensive
5. IMPORTANT: Start with ONLY the contract title "${
        contract.title
      }" as a CENTERED H1 heading - DO NOT add "CONTRACT" or "Contract Title:" before it
6. Do NOT include generic headings like "CONTRACT" at the top
7. Use <h1 style="text-align: center;">${contract.title}</h1> for the title

CRITICAL - SIGNATURE SECTION:
You MUST end the contract with this EXACT signature section (copy it exactly as shown):

<hr style="margin-top: 40px; margin-bottom: 30px; border: none; border-top: 2px solid #000;">

<h3 style="margin-bottom: 30px;">SIGNATURES</h3>

<table style="width: 100%; margin-top: 50px;">
  <tr>
    <td style="width: 50%; vertical-align: top; padding-right: 20px;">
      <p style="margin-bottom: 15px;"><strong>FIRST PARTY (INITIATOR)</strong></p>
      <p style="margin-bottom: 8px;">Name: {{INITIATOR_NAME}}</p>
      <p>Date: {{INITIATOR_DATE}}</p>
    </td>
    <td style="width: 50%; vertical-align: top; padding-left: 20px;">
      <p style="margin-bottom: 15px;"><strong>SECOND PARTY (RECEIVER)</strong></p>
      <p style="margin-bottom: 8px;">Name: {{RECEIVER_NAME}}</p>
      <p>Date: {{RECEIVER_DATE}}</p>
    </td>
  </tr>
</table>

⚠️ ABSOLUTELY CRITICAL - DO NOT FILL SIGNATURE PLACEHOLDERS:
- NEVER replace {{INITIATOR_NAME}}, {{RECEIVER_NAME}}, {{INITIATOR_DATE}}, or {{RECEIVER_DATE}} with actual values
- Even if names or dates are mentioned in the additional context, DO NOT use them in the signature section
- The signature section must ALWAYS contain the exact placeholders shown above
- These placeholders will be automatically filled when each party digitally signs the contract
- Signatures are captured at signing time, NOT at generation time

IMPORTANT: 
- You can use the party names (${initiatorName} and ${receiverName}) in the main contract body/clauses where needed
- If the user context requests including the current date (e.g., "mention today's date"), use the current date (${currentDate}) in the contract body/content where appropriate
- However, the SIGNATURES section at the end must ALWAYS use the exact placeholders {{INITIATOR_NAME}}, {{RECEIVER_NAME}}, {{INITIATOR_DATE}}, {{RECEIVER_DATE}}
- The current date can appear in contract clauses, effective dates, or wherever contextually relevant, but NEVER in the signature date fields
- Format the contract in clean HTML with proper semantic tags (h1, h2, h3, p, ul, li, strong, em)
- Use headings for sections, paragraphs for content, and lists where appropriate
- Do NOT include DOCTYPE, html, head, or body tags - only the content HTML
- Return ONLY the raw HTML content, nothing else`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert legal document generator specializing in Nigerian contract law. Generate professional, legally-sound contracts with proper HTML formatting.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      })

      aiGeneratedContent = completion.choices[0].message.content

      if (!aiGeneratedContent) {
        return NextResponse.json(
          { error: 'Failed to generate contract content. Please try again.' },
          { status: 500 }
        )
      }

      // Clean up markdown code blocks if present
      if (aiGeneratedContent.startsWith('```')) {
        // Remove opening code block marker (e.g., ```html or ```)
        const firstNewline = aiGeneratedContent.indexOf('\n')
        if (firstNewline !== -1) {
          aiGeneratedContent = aiGeneratedContent.substring(firstNewline + 1)
        }
      }
      if (aiGeneratedContent.endsWith('```')) {
        // Remove closing code block marker
        aiGeneratedContent = aiGeneratedContent.substring(0, aiGeneratedContent.lastIndexOf('```'))
      }
      // Trim any extra whitespace
      aiGeneratedContent = aiGeneratedContent.trim()
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
