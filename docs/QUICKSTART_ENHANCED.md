# Quick Start - Enhanced Signature Workflow

## Prerequisites

1. OpenAI API Key (for contract generation)
2. SendGrid API Key (for email notifications)
3. All dependencies installed

## Setup Steps

### 1. Add OpenAI API Key

Add to `.env` file:

```env
OPENAI_API_KEY="sk-your-api-key-here"
```

Get your API key from: https://platform.openai.com/api-keys

### 2. Verify Environment Variables

Ensure your `.env` has:

```env
DATABASE_URL="your-supabase-connection"
DIRECT_URL="your-supabase-direct-connection"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-secret"
SENDGRID_API_KEY="your-sendgrid-key"
SENDGRID_FROM_EMAIL="your-verified-email"
OPENAI_API_KEY="your-openai-key"
APP_URL="http://localhost:3001"
```

### 3. Start the Development Server

```bash
npm run dev
```

Application will start at: http://localhost:3001

## Testing the Complete Flow

### Step 1: Login

1. Navigate to http://localhost:3001
2. Login with existing account or create new one:
   - Email: `test@example.com`
   - Password: `password123`

### Step 2: Create Contract

1. Click **"New Contract"** button
2. Fill in the form:
   - **Contract Title**: "Service Agreement Test"
   - **Upload Document**: (Optional) Upload a PDF reference
   - **Initiator Name**: "John Doe"
   - **Initiator Email**: Leave empty (uses your account)
   - **Receiver Name**: "Jane Smith"
   - **Receiver Email**: "jane.smith@example.com"
   - **Additional Context**: "This is a service agreement for web development services."
3. Click **"Continue to Workflow Setup"**
4. Wait for AI to generate the contract (may take 5-10 seconds)

### Step 3: Review & Edit Contract

1. You'll be redirected to `/contracts/[id]/review`
2. Review the AI-generated contract
3. Click **"Edit Content"** to make changes (optional)
4. Click **"Save Changes"** if you edited

### Step 4: Sign as First Party

1. Click **"Sign Contract"**
2. Draw your signature in the modal
3. Click **"Confirm Signature"**
4. Your signature is saved

### Step 5: Send to Second Party

1. Click **"Send to Second Party"**
2. Confirm the action
3. Email will be sent to receiver
4. Contract status changes to `AWAITING_SIGNATURE`

### Step 6: Sign as Second Party

**Option A: Use the email link**

1. Check SendGrid dashboard for the email
2. Copy the signing link

**Option B: Get link from database**

1. Open Prisma Studio: `npx prisma studio`
2. Find your contract
3. Copy the `signingLink` value
4. Open: `http://localhost:3001/sign/[signingLink]`

**Signing Process:**

1. Review the contract
2. Click **"Sign Contract"**
3. Draw signature
4. Click **"Confirm Signature"**
5. Contract status changes to `COMPLETED`
6. Both parties receive completion emails

## Troubleshooting

### OpenAI API Issues

**Error: "OpenAI API quota exceeded"**

- Solution: Add valid `OPENAI_API_KEY` to `.env`
- Check quota at: https://platform.openai.com/usage

**Error: Contract generation failed**

- Check OpenAI API status
- Verify API key has GPT-4 access
- Check terminal logs for detailed error

### Email Issues

**Emails not sending**

- Verify `SENDGRID_API_KEY` is valid
- Ensure `SENDGRID_FROM_EMAIL` is verified in SendGrid
- Check SendGrid Activity Feed for delivery status
- In development, emails might go to spam

**Signing link not working**

- Verify `APP_URL` matches your environment
- Check `signingLinkExpiresAt` in database (should be 30 days from creation)
- Ensure signing link is generated (check `signingLink` field in database)

### Database Issues

**Fields not found**

- Run: `npx prisma generate`
- Restart TypeScript server in VS Code
- Check schema has `initiatorName` and `receiverName` fields

**Signature type errors**

- Ensure using `type` field with values `INITIATOR` or `RECEIVER`
- Not `signerType` with lowercase values

### UI Issues

**Signature canvas not responding**

- Try different browser
- Ensure react-signature-canvas is installed
- Check browser console for errors
- Try on touch-enabled device

**Modal not opening**

- Check browser console
- Ensure no JavaScript errors
- Try refreshing the page

## Features Implemented

### ✅ Contract Creation

- Name fields for both parties
- File upload for reference documents
- Additional context field for AI

### ✅ AI Contract Generation

- OpenAI GPT-4 integration
- Professional legal language
- Lagos State specific formatting
- Reference document parsing

### ✅ Contract Review & Editing

- View AI-generated content
- Edit before signing
- Save changes
- Lock after signing

### ✅ Digital Signatures

- Canvas drawing interface
- Base64 PNG storage
- Separate signatures for each party
- Signature verification

### ✅ Email Notifications

- Professional HTML templates
- Contract invitation emails
- Completion confirmation emails
- Responsive design

### ✅ Public Signing Page

- No login required for second party
- Secure signing link
- Link expiration (30 days)
- One-time signing

### ✅ Status Management

- DRAFT: Created and initiator signed
- AWAITING_SIGNATURE: Sent to receiver
- COMPLETED: Both parties signed

## Next Steps

1. **Add PDF Generation**: Implement actual PDF creation with embedded signatures
2. **File Upload**: Add cloud storage (S3/Supabase) for reference documents
3. **Dashboard Enhancement**: Show signature status and progress
4. **Download Contracts**: Allow users to download signed PDFs
5. **Audit Trail**: Track all contract actions with timestamps
6. **Notifications**: Add real-time notifications for contract updates

## API Endpoints Reference

### Contract Management

```
POST   /api/contracts              - Create contract
GET    /api/contracts              - List user's contracts
GET    /api/contracts/[id]         - Get single contract
PATCH  /api/contracts/[id]         - Update contract content
POST   /api/contracts/[id]/send    - Send to receiver
POST   /api/contracts/[id]/sign    - Save signature
```

### AI Generation

```
POST   /api/contracts/generate     - Generate contract with OpenAI
```

### Public Signing

```
GET    /api/sign/[signingLink]     - Get contract by link
POST   /api/sign/[signingLink]     - Sign via link
```

## Support

For issues:

1. Check terminal logs
2. Review Prisma Studio for database state
3. Check SendGrid dashboard for email delivery
4. Review OpenAI dashboard for API usage
5. See `docs/ENHANCED_WORKFLOW.md` for detailed documentation
