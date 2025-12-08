# ⚡ Quick Command Cheat Sheet

Copy-paste these commands for common tasks.

## 🚀 First Time Setup

```powershell
# Install everything
npm install

# Setup database
npx prisma generate
npx prisma db push

# Start development
npm run dev
```

## 🔧 Daily Development

```powershell
# Start server
npm run dev

# View database
npm run db:studio

# Add test data
npm run db:seed
```

## 🗄️ Database Commands

```powershell
# Update schema
npx prisma db push

# Reset database
npx prisma db push --force-reset

# View in browser
npm run db:studio
```

## 🐛 Troubleshooting

```powershell
# Clear and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Clear Next.js cache
Remove-Item -Recurse -Force .next
npm run dev

# Generate secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 📦 Build & Deploy

```powershell
# Build for production
npm run build

# Start production
npm run start

# Deploy to Vercel
vercel --prod
```

## 🔍 Quick Checks

```powershell
# Check errors
npm run lint

# View env
Get-Content .env

# Check Node version
node --version
```

---

**Keep this handy for quick reference!** 📌
