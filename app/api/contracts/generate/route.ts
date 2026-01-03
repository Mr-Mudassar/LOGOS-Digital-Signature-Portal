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

    // Validate and upload file if provided
    let uploadedFileId: string | null = null
    if (referenceDocument) {
      const fileName = referenceDocument.name.toLowerCase()
      const isDocx = fileName.endsWith('.docx')
      const isPdf = fileName.endsWith('.pdf')

      // Validate file type - only accept DOCX or PDF
      if (!isDocx && !isPdf) {
        return NextResponse.json(
          { error: 'Only DOCX and PDF files are supported for reference documents' },
          { status: 400 }
        )
      }

      // Check file size (10MB limit)
      if (referenceDocument.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
      }

      try {
        // Upload file directly to OpenAI
        const buffer = await referenceDocument.arrayBuffer()
        const file = await openai.files.create({
          file: new File([buffer], referenceDocument.name, { type: referenceDocument.type }),
          purpose: 'assistants',
        })
        uploadedFileId = file.id
        console.log('File uploaded to OpenAI:', uploadedFileId)
      } catch (uploadError) {
        console.error('File upload error:', uploadError)
        return NextResponse.json({ error: 'Failed to upload file to OpenAI' }, { status: 500 })
      }
    }

    // Generate contract using OpenAI Assistants API
    let aiGeneratedContent: string | null = null

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === '') {
      // Clean up uploaded file if exists
      if (uploadedFileId) {
        try {
          await openai.files.delete(uploadedFileId)
        } catch (e) {
          console.error('Failed to delete file:', e)
        }
      }
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

      const instructionPrompt = `You are a legal document generator for Lagos State, Nigeria. Generate a professional legal contract based on the following information:

Contract Title: ${contract.title}
First Party (Initiator): ${initiatorName}
Second Party (Receiver): ${receiverName}
Current Date: ${currentDate}

${userContext ? `Additional Context: ${userContext}` : ''}

${
  uploadedFileId
    ? 'IMPORTANT: A reference document has been provided as an attachment. Please carefully review and analyze this document, and incorporate all relevant information, terms, clauses, and context from it into the contract. Use the document content as a primary source of information for generating the contract.'
    : ''
}

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
      <p style="margin-bottom: 8px;">LASRRA Number: {{INITIATOR_LASRRA}}</p>
      <p>Date: {{INITIATOR_DATE}}</p>
    </td>
    <td style="width: 50%; vertical-align: top; padding-left: 20px;">
      <p style="margin-bottom: 15px;"><strong>SECOND PARTY (RECEIVER)</strong></p>
      <p style="margin-bottom: 8px;">Name: {{RECEIVER_NAME}}</p>
      <p style="margin-bottom: 8px;">LASRRA Number: {{RECEIVER_LASRRA}}</p>
      <p>Date: {{RECEIVER_DATE}}</p>
    </td>
  </tr>
</table>

⚠️ ABSOLUTELY CRITICAL - DO NOT FILL SIGNATURE PLACEHOLDERS:
- NEVER replace {{INITIATOR_NAME}}, {{RECEIVER_NAME}}, {{INITIATOR_LASRRA}}, {{RECEIVER_LASRRA}}, {{INITIATOR_DATE}}, or {{RECEIVER_DATE}} with actual values
- Even if names or dates are mentioned in the additional context or reference document, DO NOT use them in the signature section
- The signature section must ALWAYS contain the exact placeholders shown above
- These placeholders will be automatically filled when each party digitally signs the contract
- Signatures are captured at signing time, NOT at generation time

IMPORTANT: 
- You can use the party names (${initiatorName} and ${receiverName}) in the main contract body/clauses where needed
- If the user context or reference document requests including the current date, use the current date (${currentDate}) in the contract body/content where appropriate
- However, the SIGNATURES section at the end must ALWAYS use the exact placeholders {{INITIATOR_NAME}}, {{RECEIVER_NAME}}, {{INITIATOR_LASRRA}}, {{RECEIVER_LASRRA}}, {{INITIATOR_DATE}}, {{RECEIVER_DATE}}
- The current date can appear in contract clauses, effective dates, or wherever contextually relevant, but NEVER in the signature date fields
- Format the contract in clean HTML with proper semantic tags (h1, h2, h3, p, ul, li, strong, em)
- Use headings for sections, paragraphs for content, and lists where appropriate
- Do NOT include DOCTYPE, html, head, or body tags - only the content HTML
- Return ONLY the raw HTML content, nothing else`

      // Create an assistant
      const assistant = await openai.beta.assistants.create({
        name: 'Contract Generator',
        instructions: instructionPrompt,
        model: 'gpt-4o-mini',
        tools: uploadedFileId ? [{ type: 'file_search' }] : [],
      })

      // Create a thread
      const thread = await openai.beta.threads.create()
      const threadId = thread.id
      console.log('Thread created:', threadId)

      // Create message with optional file attachment
      const messageParams: any = {
        role: 'user',
        content: 'Please generate the contract as specified in your instructions.',
      }

      if (uploadedFileId) {
        messageParams.attachments = [
          {
            file_id: uploadedFileId,
            tools: [{ type: 'file_search' }],
          },
        ]
      }

      await openai.beta.threads.messages.create(threadId, messageParams)

      // Run the assistant
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistant.id,
      })
      const runId = run.id
      console.log('Run created:', runId, 'for thread:', threadId)

      // Wait for completion (with timeout)
      let runStatus = await openai.beta.threads.runs.retrieve(runId, { thread_id: threadId })
      let attempts = 0
      const maxAttempts = 60 // 60 seconds timeout

      while (
        runStatus.status !== 'completed' &&
        runStatus.status !== 'failed' &&
        attempts < maxAttempts
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        runStatus = await openai.beta.threads.runs.retrieve(runId, { thread_id: threadId })
        attempts++
      }

      if (runStatus.status === 'failed') {
        throw new Error('Assistant run failed')
      }

      if (attempts >= maxAttempts) {
        throw new Error('Assistant run timed out')
      }

      // Retrieve the generated message
      const messages = await openai.beta.threads.messages.list(threadId)
      const assistantMessage = messages.data.find((msg) => msg.role === 'assistant')

      if (!assistantMessage || !assistantMessage.content[0]) {
        throw new Error('No response from assistant')
      }

      // Extract the text content
      const content = assistantMessage.content[0]
      if (content.type === 'text') {
        aiGeneratedContent = content.text.value
      } else {
        throw new Error('Unexpected response type from assistant')
      }

      // Clean up resources
      await openai.beta.assistants.delete(assistant.id)
      await openai.beta.threads.delete(threadId)
      if (uploadedFileId) {
        try {
          await openai.files.delete(uploadedFileId)
        } catch (e) {
          console.error('Failed to delete file:', e)
        }
      }

      if (!aiGeneratedContent) {
        return NextResponse.json(
          { error: 'Failed to generate contract content. Please try again.' },
          { status: 500 }
        )
      }

      // Clean up markdown code blocks if present
      if (aiGeneratedContent.startsWith('```')) {
        const firstNewline = aiGeneratedContent.indexOf('\n')
        if (firstNewline !== -1) {
          aiGeneratedContent = aiGeneratedContent.substring(firstNewline + 1)
        }
      }
      if (aiGeneratedContent.endsWith('```')) {
        aiGeneratedContent = aiGeneratedContent.substring(0, aiGeneratedContent.lastIndexOf('```'))
      }
      aiGeneratedContent = aiGeneratedContent.trim()
    } catch (openaiError: any) {
      console.error('OpenAI API error:', openaiError)

      // Clean up uploaded file on error
      if (uploadedFileId) {
        try {
          await openai.files.delete(uploadedFileId)
        } catch (e) {
          console.error('Failed to delete file:', e)
        }
      }

      // Return specific error messages
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
