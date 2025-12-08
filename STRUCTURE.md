# 📂 Complete File Structure

```
mowu-mvp/
│
├── 📁 app/                                    # Next.js App Router
│   ├── 📁 api/                               # Backend API Routes
│   │   ├── 📁 auth/                          # Authentication endpoints
│   │   │   ├── 📁 [...nextauth]/
│   │   │   │   └── route.ts                  # NextAuth handler
│   │   │   ├── 📁 signup/
│   │   │   │   └── route.ts                  # User registration
│   │   │   ├── 📁 forgot-password/
│   │   │   │   └── route.ts                  # Request password reset
│   │   │   └── 📁 reset-password/
│   │   │       └── route.ts                  # Reset password
│   │   └── 📁 contracts/                     # Contract endpoints
│   │       ├── route.ts                      # GET (list) / POST (create)
│   │       └── 📁 [id]/                      # Dynamic contract ID
│   │           ├── route.ts                  # GET (single) / DELETE
│   │           └── 📁 send/
│   │               └── route.ts              # POST (send to receiver)
│   │
│   ├── 📁 auth/                              # Authentication pages
│   │   ├── 📁 signin/
│   │   │   └── page.tsx                      # Login page
│   │   └── 📁 signup/
│   │       └── page.tsx                      # Registration page
│   │
│   ├── 📁 dashboard/                         # Dashboard pages
│   │   └── page.tsx                          # Main dashboard
│   │
│   ├── globals.css                           # Global Tailwind styles
│   ├── layout.tsx                            # Root layout with providers
│   ├── page.tsx                              # Home page (redirects)
│   ├── loading.tsx                           # Global loading UI
│   ├── error.tsx                             # Error boundary
│   └── not-found.tsx                         # 404 page
│
├── 📁 components/                            # React components
│   ├── Providers.tsx                         # NextAuth session provider
│   └── 📁 dashboard/                         # Dashboard-specific components
│       ├── Sidebar.tsx                       # Navigation sidebar
│       ├── StatsCard.tsx                     # Statistics card component
│       ├── ContractCard.tsx                  # Contract list item
│       └── CreateContractModal.tsx           # New contract modal
│
├── 📁 lib/                                   # Utility libraries
│   ├── auth.ts                               # NextAuth configuration
│   ├── prisma.ts                             # Prisma client singleton
│   ├── utils.ts                              # Helper functions
│   └── file-upload.ts                        # File handling utilities
│
├── 📁 prisma/                                # Prisma ORM
│   ├── schema.prisma                         # Database schema
│   └── seed.ts                               # Database seeding script
│
├── 📁 types/                                 # TypeScript definitions
│   ├── index.ts                              # Application types
│   └── next-auth.d.ts                        # NextAuth type extensions
│
├── 📁 public/                                # Static assets (create if needed)
│   └── (images, icons, etc.)
│
├── 📄 .env                                   # Environment variables (DO NOT COMMIT)
├── 📄 .env.example                           # Environment template
├── 📄 .gitignore                             # Git ignore rules
├── 📄 .eslintrc.json                         # ESLint configuration
├── 📄 middleware.ts                          # Next.js middleware (route protection)
├── 📄 next.config.mjs                        # Next.js configuration
├── 📄 package.json                           # Dependencies and scripts
├── 📄 postcss.config.mjs                     # PostCSS configuration
├── 📄 tailwind.config.ts                     # Tailwind CSS configuration
├── 📄 tsconfig.json                          # TypeScript configuration
│
├── 📄 README.md                              # Main documentation
├── 📄 SETUP.md                               # Detailed setup guide
├── 📄 QUICKSTART.md                          # 5-minute quick start
├── 📄 COMMANDS.md                            # Command reference
├── 📄 PROJECT_SUMMARY.md                     # Project overview
├── 📄 STRUCTURE.md                           # This file
└── 📄 install.ps1                            # PowerShell install script
```

## 📋 File Descriptions

### Root Configuration Files

| File                 | Purpose                                 |
| -------------------- | --------------------------------------- |
| `package.json`       | Dependencies, scripts, project metadata |
| `tsconfig.json`      | TypeScript compiler options             |
| `next.config.mjs`    | Next.js framework configuration         |
| `tailwind.config.ts` | Tailwind CSS customization              |
| `postcss.config.mjs` | PostCSS plugins (Tailwind)              |
| `.eslintrc.json`     | Code linting rules                      |
| `middleware.ts`      | Route protection middleware             |
| `.env`               | Environment variables (secret)          |
| `.env.example`       | Environment template (committed)        |
| `.gitignore`         | Files to exclude from git               |

### App Directory (`app/`)

#### API Routes (`app/api/`)

- **Authentication** (`auth/`)

  - `[...nextauth]/route.ts` - NextAuth OAuth handler
  - `signup/route.ts` - User registration endpoint
  - `forgot-password/route.ts` - Password reset request
  - `reset-password/route.ts` - Password reset confirmation

- **Contracts** (`contracts/`)
  - `route.ts` - List all contracts (GET), Create new (POST)
  - `[id]/route.ts` - Get single contract (GET), Delete (DELETE)
  - `[id]/send/route.ts` - Send contract to receiver (POST)

#### Pages (`app/`)

- `page.tsx` - Home page (redirects to signin)
- `layout.tsx` - Root layout with metadata and providers
- `globals.css` - Global styles and Tailwind imports
- `loading.tsx` - Loading state UI
- `error.tsx` - Error boundary component
- `not-found.tsx` - 404 page

- **Auth Pages** (`auth/`)

  - `signin/page.tsx` - Login form
  - `signup/page.tsx` - Registration form

- **Dashboard** (`dashboard/`)
  - `page.tsx` - Main dashboard with contract list

### Components (`components/`)

| Component                           | Description                             |
| ----------------------------------- | --------------------------------------- |
| `Providers.tsx`                     | Wraps app with NextAuth SessionProvider |
| `dashboard/Sidebar.tsx`             | Navigation sidebar with logo and menu   |
| `dashboard/StatsCard.tsx`           | Statistics display card                 |
| `dashboard/ContractCard.tsx`        | Individual contract in list             |
| `dashboard/CreateContractModal.tsx` | Modal for creating new contract         |

### Library Files (`lib/`)

| File             | Purpose                                |
| ---------------- | -------------------------------------- |
| `auth.ts`        | NextAuth.js configuration and options  |
| `prisma.ts`      | Prisma Client singleton instance       |
| `utils.ts`       | Date formatting, text truncation, etc. |
| `file-upload.ts` | File validation and upload utilities   |

### Database (`prisma/`)

| File            | Purpose                                   |
| --------------- | ----------------------------------------- |
| `schema.prisma` | Database schema with models and relations |
| `seed.ts`       | Test data seeding script                  |

### Types (`types/`)

| File             | Purpose                                  |
| ---------------- | ---------------------------------------- |
| `index.ts`       | Application-wide TypeScript types        |
| `next-auth.d.ts` | NextAuth session and JWT type extensions |

## 🎨 Design Pattern

### Architecture

- **Frontend**: React Server Components + Client Components
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL via Prisma ORM
- **Authentication**: NextAuth.js with JWT sessions
- **Styling**: Tailwind CSS utility classes

### Routing

```
/                           → Redirect to /auth/signin
/auth/signin               → Login page
/auth/signup               → Registration page
/dashboard                 → Protected: Main dashboard
/api/auth/[...nextauth]    → NextAuth endpoints
/api/contracts             → Contract CRUD
```

### Data Flow

```
User Action
    ↓
React Component (Client)
    ↓
API Route (Server)
    ↓
Prisma ORM
    ↓
PostgreSQL Database
    ↓
Response back up the chain
```

## 🔒 Protected Routes

Routes protected by `middleware.ts`:

- `/dashboard/*` - Requires authentication
- `/contracts/*` - Requires authentication

Public routes:

- `/auth/*` - Authentication pages
- `/api/auth/*` - Auth endpoints
- `/sign/*` - Public signing links (to be implemented)

## 📊 Database Schema

### Tables

1. **users** - User accounts
2. **contracts** - Contract documents
3. **signatures** - Digital signatures
4. **password_reset_tokens** - Reset tokens

### Relationships

- User → Contracts (one-to-many, as initiator)
- User → Contracts (one-to-many, as receiver)
- User → Signatures (one-to-many)
- Contract → Signatures (one-to-many)

## 🚀 Adding New Features

### Add a New Page

1. Create `app/your-page/page.tsx`
2. Export default React component
3. Add to navigation in `Sidebar.tsx` if needed

### Add a New API Route

1. Create `app/api/your-route/route.ts`
2. Export GET, POST, etc. functions
3. Use in components via `fetch` or `axios`

### Add a New Component

1. Create `components/YourComponent.tsx`
2. Import where needed
3. Add TypeScript props interface

### Add a Database Model

1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push`
3. Run `npx prisma generate`
4. Update TypeScript types if needed

---

**This structure follows Next.js 14 App Router best practices** ✨
