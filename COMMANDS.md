# 📝 Commands Reference

A quick reference for all commands you'll need during development.

## 🚀 Initial Setup

### Install Dependencies

```powershell
npm install
```

### Generate NextAuth Secret

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Setup Database

```powershell
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database with test data
npm run db:seed
```

## 🔧 Development

### Start Development Server

```powershell
npm run dev
```

Access at: http://localhost:3000

### Build for Production

```powershell
npm run build
```

### Start Production Server

```powershell
npm run start
```

### Run Linter

```powershell
npm run lint
```

## 🗄️ Database Commands

### View Database in Browser (Prisma Studio)

```powershell
npm run db:studio
```

Opens at: http://localhost:5555

### Push Schema Changes

```powershell
npm run db:push
```

### Reset Database (⚠️ Deletes all data)

```powershell
npx prisma db push --force-reset
```

### Seed Test Data

```powershell
npm run db:seed
```

### Create Migration

```powershell
npx prisma migrate dev --name your_migration_name
```

### View Generated Client

```powershell
npx prisma generate
```

## 🧪 Testing

### Test User Accounts

After running `npm run db:seed`:

**Account 1:**

- Email: john.doe@example.com
- Password: password123

**Account 2:**

- Email: jane.smith@example.com
- Password: password123

## 🔍 Debugging

### Check Environment Variables

```powershell
# Show all env vars
Get-Content .env

# Check if DATABASE_URL is set
$env:DATABASE_URL
```

### Clear Next.js Cache

```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

### Clear Node Modules (if issues)

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Check Prisma Client

```powershell
npx prisma validate
npx prisma format
```

## 📦 Useful PowerShell Commands

### Check Node Version

```powershell
node --version
```

### Check npm Version

```powershell
npm --version
```

### List Installed Packages

```powershell
npm list --depth=0
```

### Update Dependencies

```powershell
npm update
```

### Check for Outdated Packages

```powershell
npm outdated
```

## 🌐 Git Commands (if using version control)

### Initialize Repository

```powershell
git init
git add .
git commit -m "Initial commit"
```

### Create .gitignore (already included)

The project already has a `.gitignore` file that excludes:

- node_modules/
- .env
- .next/
- build files

## 🚢 Deployment (Vercel)

### Install Vercel CLI

```powershell
npm install -g vercel
```

### Login to Vercel

```powershell
vercel login
```

### Deploy

```powershell
vercel
```

### Deploy to Production

```powershell
vercel --prod
```

## 🔐 Environment Variables for Vercel

When deploying, add these environment variables in Vercel dashboard:

```
DATABASE_URL=your-supabase-url
NEXTAUTH_URL=your-vercel-url
NEXTAUTH_SECRET=your-secret
SENDGRID_API_KEY=your-key
SENDGRID_FROM_EMAIL=your-email
OPENAI_API_KEY=your-key
APP_URL=your-vercel-url
```

## 📊 Database Inspection

### Connect to Supabase

1. Go to your Supabase project
2. Click "Table Editor"
3. View your tables:
   - users
   - contracts
   - signatures
   - password_reset_tokens

### SQL Query in Supabase

```sql
-- Count users
SELECT COUNT(*) FROM users;

-- List all contracts
SELECT * FROM contracts ORDER BY "createdAt" DESC;

-- Check signatures
SELECT * FROM signatures;
```

## 🐛 Troubleshooting Commands

### Check if Port 3000 is in Use

```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess
```

### Kill Process on Port 3000

```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
```

### Check TypeScript Errors

```powershell
npx tsc --noEmit
```

### Validate Prisma Schema

```powershell
npx prisma validate
```

## 📝 Quick Workflow

### Daily Development Flow

```powershell
# 1. Start development
npm run dev

# 2. Open Prisma Studio (in new terminal)
npm run db:studio

# 3. Make changes...

# 4. If you changed Prisma schema
npx prisma db push
npx prisma generate

# 5. Test changes
# Visit http://localhost:3000
```

### After Pulling Changes

```powershell
npm install              # Install new dependencies
npx prisma generate      # Update Prisma Client
npx prisma db push       # Update database
npm run dev             # Start development
```

## 🎯 Common Tasks

### Add a New Environment Variable

1. Add to `.env` file
2. Add to `.env.example` (without value)
3. Restart dev server
4. Add to Vercel dashboard (if deployed)

### Add a New API Route

1. Create file in `app/api/your-route/route.ts`
2. Export GET, POST, etc. functions
3. Test with http://localhost:3000/api/your-route

### Add a New Page

1. Create folder in `app/your-page/`
2. Add `page.tsx` file
3. Export default component
4. Access at http://localhost:3000/your-page

### Add a New Database Table

1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push`
3. Run `npx prisma generate`
4. Restart dev server

---

**Keep this file handy for quick reference during development!** 📌
