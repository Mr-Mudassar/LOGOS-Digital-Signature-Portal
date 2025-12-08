# Lagos State Digital Signature Portal - MVP

A full-stack Next.js application for document automation and digital signature management.

## 📚 Documentation Quick Links

- 🚀 **[QUICKSTART.md](./QUICKSTART.md)** - Get running in 5 minutes
- 📖 **[INDEX.md](./INDEX.md)** - Navigate all documentation
- ⚡ **[CHEATSHEET.md](./CHEATSHEET.md)** - Quick command reference
- 📋 **[COMPLETE.md](./COMPLETE.md)** - Project completion summary

**New here?** Start with [QUICKSTART.md](./QUICKSTART.md) →

## Features

- 🔐 **Authentication**: Email/password signup and signin with NextAuth.js
- 📝 **Contract Management**: Create, view, and manage contracts
- ✍️ **Digital Signatures**: Sign and send contracts for signature
- 📧 **Email Notifications**: Automated emails via SendGrid
- 🤖 **AI Integration**: Contract generation using OpenAI (ready to integrate)
- 💾 **Database**: PostgreSQL with Prisma ORM (Supabase ready)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Email**: SendGrid
- **AI**: OpenAI API (ready to integrate)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- SendGrid account
- OpenAI API key

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

Create a `.env` file in the root directory:

```bash
# Database (Get from Supabase)
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32

# SendGrid
SENDGRID_API_KEY="your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# App URL
APP_URL="http://localhost:3000"
```

3. Set up the database:

```bash
npx prisma generate
npx prisma db push
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
mowu-mvp/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   └── contracts/    # Contract endpoints
│   ├── auth/             # Auth pages (signin, signup)
│   ├── dashboard/        # Dashboard page
│   └── layout.tsx        # Root layout
├── components/
│   └── dashboard/        # Dashboard components
├── lib/
│   ├── auth.ts          # NextAuth configuration
│   ├── prisma.ts        # Prisma client
│   └── utils.ts         # Utility functions
├── prisma/
│   └── schema.prisma    # Database schema
└── types/               # TypeScript types
```

## Database Schema

The application uses the following main models:

- **User**: User accounts with email/password authentication
- **Contract**: Contract documents with status tracking
- **Signature**: Digital signatures for contracts
- **PasswordResetToken**: Tokens for password reset functionality

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in (handled by NextAuth)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Contracts

- `GET /api/contracts` - Get all contracts for logged-in user
- `POST /api/contracts` - Create new contract
- `GET /api/contracts/[id]` - Get specific contract
- `DELETE /api/contracts/[id]` - Delete contract (draft only)
- `POST /api/contracts/[id]/send` - Send contract to receiver

## Next Steps

1. **Connect to Supabase**: Update the `DATABASE_URL` in your `.env` file with your Supabase connection string
2. **Configure SendGrid**: Add your SendGrid API key and verified sender email
3. **Add OpenAI Integration**: Implement AI contract generation in the workflow
4. **File Upload**: Implement file upload to AWS S3 or similar storage
5. **PDF Generation**: Add PDF generation and signature embedding
6. **Signature Component**: Integrate a signature pad library

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Contributing

This is an MVP project. Feel free to extend and customize as needed.

## License

MIT
