# 🚀 Quick Start Guide

Get your Lagos State Digital Signature Portal running in 5 minutes!

## Prerequisites

- ✅ Node.js 18 or higher installed
- ✅ A Supabase account (free tier works)
- ✅ A code editor (VS Code recommended)

## Step-by-Step Installation

### 1️⃣ Install Dependencies (1 minute)

Open PowerShell in the project directory and run:

```powershell
npm install
```

### 2️⃣ Set Up Supabase Database (2 minutes)

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: lagos-signature-portal
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
4. Click "Create new project" and wait ~2 minutes
5. Once ready, go to **Settings** → **Database**
6. Copy the **Connection string** (URI format)
7. Click "Show" next to the URI and copy it

### 3️⃣ Configure Environment Variables (1 minute)

1. Open the `.env` file in your project
2. Replace `DATABASE_URL` with your Supabase connection string
3. Replace `[YOUR-PASSWORD]` in the URL with your database password
4. Generate a secret for NextAuth:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

5. Copy the output and paste it as `NEXTAUTH_SECRET` in `.env`

Your `.env` should look like:

```env
DATABASE_URL="postgresql://postgres.xxx:yourpassword@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
APP_URL="http://localhost:3000"
```

### 4️⃣ Initialize Database (1 minute)

Run these commands:

```powershell
npx prisma generate
npx prisma db push
```

You should see:

```
✓ Generated Prisma Client
✓ Your database is now in sync with your Prisma schema.
```

### 5️⃣ Start the Application

```powershell
npm run dev
```

Open your browser and go to: **http://localhost:3000**

## 🎉 You're Ready!

### Create Your First Account

1. Click **"Sign up"**
2. Enter your details:
   - Name: Your Name
   - Email: your@email.com
   - Password: (min 8 characters)
3. Click **"Sign Up"**

### Create Your First Contract

1. You'll land on the Dashboard
2. Click **"New Contract"**
3. Fill in:
   - **Contract Title**: "Test Contract"
   - **Counterparty**: Enter an email address
   - (Optional) Upload a document
4. Click **"Continue to Workflow Setup"**

✅ **Success!** Your contract is created.

## Optional: Email Setup

To send actual emails, configure SendGrid:

1. Sign up at [sendgrid.com](https://sendgrid.com) (free tier available)
2. Verify your sender email
3. Create an API key
4. Add to `.env`:

```env
SENDGRID_API_KEY="your-api-key"
SENDGRID_FROM_EMAIL="your-verified-email@domain.com"
```

## Troubleshooting

### "Can't connect to database"

- Check your `DATABASE_URL` in `.env`
- Make sure you replaced `[YOUR-PASSWORD]` with actual password
- Verify Supabase project is running

### "Module not found"

```powershell
rm -r node_modules
rm package-lock.json
npm install
```

### Reset Database

```powershell
npx prisma db push --force-reset
```

## What's Next?

- ✅ User authentication working
- ✅ Contract creation working
- ✅ Dashboard with contract listing
- 🔄 Add SendGrid for emails
- 🔄 Add OpenAI for contract generation
- 🔄 Add file upload (AWS S3)
- 🔄 Add signature functionality

## Need Help?

Check these files:

- `SETUP.md` - Detailed setup instructions
- `README.md` - Full project documentation
- `.env.example` - Environment variable template

---

**Happy coding!** 🎊
