# Setup Guide - Lagos State Digital Signature Portal

## Quick Start Steps

### 1. Install Dependencies

Open your terminal in the project directory and run:

```powershell
npm install
```

This will install all required packages including Next.js, Prisma, NextAuth, and other dependencies.

### 2. Set Up Supabase Database

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the database to be provisioned
3. Go to Project Settings > Database
4. Copy the "Connection string" (URI format)
5. Replace the `DATABASE_URL` in your `.env` file with this connection string

**Important**: Make sure to replace `[YOUR-PASSWORD]` in the connection string with your actual database password.

Example:

```
DATABASE_URL="postgresql://postgres.xxxxx:yourpassword@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```powershell
Copy-Item .env.example .env
```

Then edit `.env` and fill in these values:

**Required:**

```bash
DATABASE_URL="your-supabase-connection-string"
NEXTAUTH_SECRET="generate-with-command-below"
APP_URL="http://localhost:3000"
```

**For Email (SendGrid):**

```bash
SENDGRID_API_KEY="your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
```

**For AI (OpenAI):**

```bash
OPENAI_API_KEY="your-openai-api-key"
```

To generate NEXTAUTH_SECRET, run:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Initialize the Database

Run these commands to set up your database schema:

```powershell
npx prisma generate
npx prisma db push
```

This will:

- Generate the Prisma Client
- Create all tables in your Supabase database

### 5. Run the Development Server

```powershell
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Testing the Application

### Create Your First User

1. Navigate to http://localhost:3000
2. You'll be redirected to the Sign In page
3. Click "Sign up" to create a new account
4. Fill in your details:
   - Full Name
   - Email
   - Password (minimum 8 characters)
5. Click "Sign Up"

### Create Your First Contract

1. After signing in, you'll see the Dashboard
2. Click the "New Contract" button
3. Fill in the contract details:
   - **Contract Title**: e.g., "Housing Lease Agreement"
   - **Upload Document**: Choose a PDF or DOCX file
   - **Primary Party**: Your email (optional)
   - **Counterparty**: Email of the person who needs to sign
   - **Additional Context**: Any extra instructions (optional)
4. Click "Continue to Workflow Setup"
5. The contract will be created and an email sent to the counterparty

## Email Configuration (Optional but Recommended)

### Setting Up SendGrid

1. Create a free account at [SendGrid](https://sendgrid.com)
2. Verify your sender email address
3. Create an API key:
   - Go to Settings > API Keys
   - Click "Create API Key"
   - Choose "Full Access"
   - Copy the API key
4. Add to your `.env` file:
   ```
   SENDGRID_API_KEY="your-api-key"
   SENDGRID_FROM_EMAIL="your-verified-email@domain.com"
   ```

**Note**: Without SendGrid configured, emails won't be sent, but you can still test the application.

## Project Structure

```
mowu-mvp/
├── app/
│   ├── api/              # Backend API routes
│   │   ├── auth/         # Authentication (signup, signin, password reset)
│   │   └── contracts/    # Contract management
│   ├── auth/             # Auth pages (signin, signup)
│   ├── dashboard/        # Main dashboard
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Home page (redirects to signin)
├── components/
│   └── dashboard/        # Reusable dashboard components
│       ├── Sidebar.tsx
│       ├── StatsCard.tsx
│       ├── ContractCard.tsx
│       └── CreateContractModal.tsx
├── lib/
│   ├── auth.ts          # NextAuth configuration
│   ├── prisma.ts        # Database client
│   └── utils.ts         # Helper functions
├── prisma/
│   └── schema.prisma    # Database schema
├── .env.example         # Environment variables template
└── README.md            # Project documentation
```

## Database Schema Overview

The application uses 4 main tables:

1. **users** - User accounts with authentication
2. **contracts** - Contract documents and metadata
3. **signatures** - Digital signatures on contracts
4. **password_reset_tokens** - Temporary tokens for password resets

## Available Pages

- `/` - Home (redirects to signin)
- `/auth/signin` - Sign in page
- `/auth/signup` - Create account
- `/auth/forgot-password` - Request password reset
- `/dashboard` - Main dashboard with contract list

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create account
- `POST /api/auth/forgot-password` - Request reset
- `POST /api/auth/reset-password` - Reset password

### Contracts

- `GET /api/contracts` - List all user's contracts
- `POST /api/contracts` - Create new contract
- `GET /api/contracts/[id]` - Get contract details
- `DELETE /api/contracts/[id]` - Delete draft contract
- `POST /api/contracts/[id]/send` - Send to counterparty

## Troubleshooting

### "Cannot connect to database"

- Check your DATABASE_URL in `.env`
- Make sure your Supabase project is active
- Verify the password in the connection string

### "NextAuth error"

- Make sure NEXTAUTH_SECRET is set in `.env`
- Ensure NEXTAUTH_URL matches your app URL

### "Module not found"

- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`

### Database schema issues

- Run `npx prisma db push --force-reset` to reset the database
- Run `npx prisma generate` to regenerate the client

## Next Steps

1. ✅ Connect your Supabase database
2. ✅ Configure SendGrid for emails
3. 🔄 Add OpenAI integration for contract generation
4. 🔄 Implement file upload to AWS S3
5. 🔄 Add PDF generation with embedded signatures
6. 🔄 Create signature pad component
7. 🔄 Add receiver signing flow

## Need Help?

- Check the main [README.md](./README.md) for more details
- Review the Prisma schema in `prisma/schema.prisma`
- Look at the API routes in `app/api/` for backend logic
- Check component files in `components/dashboard/` for UI components

Happy coding! 🚀
