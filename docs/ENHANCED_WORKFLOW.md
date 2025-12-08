# Enhanced Signature Workflow - Implementation Guide

## Overview

The Lagos State Digital Signature Portal now includes a comprehensive AI-powered contract generation and dual-party signature workflow. This document explains the complete flow from contract creation to completion.

## Complete Workflow

### Step 1: Contract Creation (Initiator)

1. **User clicks "New Contract"** on the dashboard
2. **Fills out the form** with:

   - Contract title
   - Reference document (optional PDF/DOCX)
   - **Initiator name** (First party)
   - Initiator email (optional, defaults to logged-in user)
   - **Receiver name** (Second party)
   - Receiver email
   - Additional context (optional instructions for AI)

3. **Form submission triggers two API calls:**
   - `POST /api/contracts` - Creates the contract record
   - `POST /api/contracts/generate` - Generates contract using OpenAI

### Step 2: AI Contract Generation

The generate endpoint:

1. Extracts text from reference document if provided
2. Sends prompt to OpenAI GPT-4 with:
   - Contract title
   - Both party names
   - User context
   - Reference document content
3. Receives professionally formatted legal contract
4. Saves AI-generated content to database
5. Redirects user to review page

### Step 3: Contract Review & Editing (Initiator)

At `/contracts/[id]/review`:

1. **Displays AI-generated contract** with both party names
2. **Edit functionality:**
   - Click "Edit Content" to modify the contract
   - Make changes in textarea
   - Click "Save Changes" to update
3. **Contract cannot be edited after signing**

### Step 4: First Party Signature (Initiator)

1. **Click "Sign Contract"** button
2. **Signature modal opens** with drawing canvas
3. **Draw signature** using mouse/trackpad/touchscreen
4. **Confirm signature:**
   - Signature saved as base64 PNG image
   - Stored in `signatures` table with `signerType: 'initiator'`
   - Contract remains in DRAFT status
5. **"Send to Second Party" button appears**

### Step 5: Send to Receiver

1. **Click "Send to Second Party"**
2. **API call** `POST /api/contracts/[id]/send`:
   - Updates contract status to `AWAITING_SIGNATURE`
   - Sends professional email to receiver with:
     - Contract title and initiator name
     - Unique signing link
     - Expiration notice (30 days)
3. **Email template includes:**
   - Professional Lagos State branding
   - Contract information
   - Call-to-action button
   - Direct signing link

### Step 6: Second Party Signing

1. **Receiver clicks link** in email
2. **Public signing page** loads at `/sign/[signingLink]`
3. **Page displays:**
   - Contract title and details
   - Both party names (initiator marked as signed)
   - Full contract content
   - "Sign Contract" button
4. **Receiver clicks "Sign Contract"**
5. **Signature modal opens**
6. **Receiver draws signature**
7. **On confirmation:**
   - Signature saved with `signerType: 'receiver'`
   - Contract status updated to `COMPLETED`
   - Completion timestamp recorded
   - **Completion emails sent to both parties**

### Step 7: Contract Completion

Both parties receive professional email with:

- Confirmation of completion
- Contract title
- Both party names with checkmarks
- Legal binding notice
- Dashboard access information

## Technical Implementation

### Database Schema

```prisma
model Contract {
  id                    String         @id @default(cuid())
  title                 String
  status                ContractStatus @default(DRAFT)

  // AI Generation
  referenceDocumentUrl  String?
  referenceDocumentName String?
  userContext           String?        @db.Text
  aiGeneratedContent    String?        @db.Text

  // Parties
  initiatorId           String
  initiatorName         String
  initiatorEmail        String?
  receiverName          String
  receiverEmail         String

  // Signing
  signingLink           String?        @unique
  signingLinkExpiresAt  DateTime?

  signatures            Signature[]
}

model Signature {
  id            String   @id @default(cuid())
  contractId    String
  userId        String
  signatureData String   @db.Text  // Base64 PNG
  signerType    String   // 'initiator' or 'receiver'
  signedAt      DateTime @default(now())
}
```

### API Endpoints

#### Contract Management

- `POST /api/contracts` - Create contract
- `GET /api/contracts` - List user's contracts
- `GET /api/contracts/[id]` - Get single contract
- `PATCH /api/contracts/[id]` - Update contract content
- `POST /api/contracts/[id]/send` - Send to receiver
- `POST /api/contracts/[id]/sign` - Save signature (authenticated)

#### AI & Generation

- `POST /api/contracts/generate` - Generate contract with OpenAI

#### Public Signing

- `GET /api/sign/[signingLink]` - Get contract by link (public)
- `POST /api/sign/[signingLink]` - Sign via link (public)

### Key Components

1. **CreateContractModal** - Form with name fields and file upload
2. **SignatureModal** - Canvas for drawing signatures
3. **ContractReviewPage** - Edit and sign interface
4. **PublicSigningPage** - Public signing interface

### Libraries Used

- **openai** - GPT-4 contract generation
- **pdf-lib** - PDF manipulation and signature embedding
- **react-signature-canvas** - Signature drawing interface
- **@sendgrid/mail** - Professional email delivery

## Environment Variables Required

```env
# OpenAI API Key
OPENAI_API_KEY="sk-..."

# App URL for email links
APP_URL="http://localhost:3001"

# SendGrid (already configured)
SENDGRID_API_KEY="SG..."
SENDGRID_FROM_EMAIL="your-email@example.com"
```

## Security Features

1. **Unique signing links** - 32-character random strings
2. **Link expiration** - 30 days from creation
3. **Authentication checks** - Initiator must be logged in
4. **Public access control** - Only receiver can sign via link
5. **Signature immutability** - Cannot sign twice
6. **Content locking** - Cannot edit after signing

## Status Flow

```
DRAFT → AWAITING_SIGNATURE → COMPLETED
  ↑           ↑                  ↑
Create    Send to          Receiver
& Sign    Receiver          Signs
```

## Email Templates

All emails use professional HTML templates with:

- Lagos State branding
- Gradient headers
- Clear call-to-action buttons
- Responsive design
- Professional typography

## PDF Generation (Future Enhancement)

The `lib/pdf-generator.ts` utility is ready for:

- Converting AI content to formatted PDF
- Embedding signatures at specific positions:
  - Initiator: Bottom left
  - Receiver: Bottom right
- Adding party names below signatures
- Professional document formatting

To implement:

1. Call `generateContractPdf()` after both parties sign
2. Upload PDF to storage (S3/Supabase)
3. Store URL in `finalDocumentUrl` field
4. Provide download link in completion emails

## Testing the Workflow

1. **Create contract:**

   ```
   Title: "Test Agreement"
   Initiator: "John Doe"
   Receiver: "Jane Smith" / jane@example.com
   Context: "This is a test contract for service agreement"
   ```

2. **Check AI generation** in review page
3. **Sign as initiator**
4. **Send to receiver**
5. **Check email** (SendGrid dashboard if in sandbox)
6. **Copy signing link** from email or database
7. **Open in incognito** window
8. **Sign as receiver**
9. **Verify completion emails** sent to both parties

## Common Issues & Solutions

### Issue: OpenAI API quota exceeded

**Solution:** Add valid OPENAI_API_KEY to .env file

### Issue: Emails not sending

**Solution:**

- Check SENDGRID_API_KEY is valid
- Verify SENDGRID_FROM_EMAIL is verified in SendGrid
- Check SendGrid dashboard for delivery status

### Issue: Signature canvas not working

**Solution:**

- Ensure react-signature-canvas is installed
- Check browser console for errors
- Test on different devices (mouse vs touch)

### Issue: Contract not found via signing link

**Solution:**

- Verify signingLink is generated (check database)
- Ensure link hasn't expired (check signingLinkExpiresAt)
- Confirm APP_URL matches your environment

## Next Steps & Enhancements

1. **PDF Download** - Implement full PDF generation with embedded signatures
2. **File Upload** - Integrate S3 or Supabase storage for reference documents
3. **Audit Trail** - Add detailed logging of all contract actions
4. **Notifications** - Add real-time notifications using WebSockets
5. **Multi-language** - Support for multiple Nigerian languages
6. **Mobile App** - React Native companion app
7. **Biometric** - Add fingerprint/face ID verification
8. **Blockchain** - Store contract hashes on blockchain for immutability

## Support

For issues or questions:

1. Check the logs in VS Code terminal
2. Review Prisma Studio for database state
3. Check SendGrid dashboard for email delivery
4. Review OpenAI API usage in their dashboard
