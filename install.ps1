# Installation Script for Lagos State Digital Signature Portal
# Run this script in PowerShell

Write-Host "========================================" -ForegroundColor Green
Write-Host "Lagos State Digital Signature Portal" -ForegroundColor Green
Write-Host "Installation Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Step 1: Check Node.js installation
Write-Host "Step 1: Checking Node.js installation..." -ForegroundColor Cyan
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit
}

# Step 2: Install dependencies
Write-Host ""
Write-Host "Step 2: Installing dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies!" -ForegroundColor Red
    exit
}

# Step 3: Check for .env file
Write-Host ""
Write-Host "Step 3: Checking environment variables..." -ForegroundColor Cyan
if (Test-Path .env) {
    Write-Host "✓ .env file exists" -ForegroundColor Green
} else {
    Write-Host "! Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✓ .env file created" -ForegroundColor Green
}

# Step 4: Generate NextAuth secret
Write-Host ""
Write-Host "Step 4: Generating NextAuth secret..." -ForegroundColor Cyan
$secret = node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
Write-Host "Your NextAuth secret: $secret" -ForegroundColor Yellow
Write-Host "Please add this to your .env file as NEXTAUTH_SECRET" -ForegroundColor Yellow

# Step 5: Instructions for database setup
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "IMPORTANT: Next Steps" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. Update .env file with your configuration:" -ForegroundColor Yellow
Write-Host "   - DATABASE_URL (from Supabase)" -ForegroundColor White
Write-Host "   - NEXTAUTH_SECRET (generated above)" -ForegroundColor White
Write-Host "   - SENDGRID_API_KEY (from SendGrid)" -ForegroundColor White
Write-Host "   - SENDGRID_FROM_EMAIL (verified email)" -ForegroundColor White
Write-Host "   - OPENAI_API_KEY (from OpenAI)" -ForegroundColor White
Write-Host ""
Write-Host "2. Set up your Supabase database:" -ForegroundColor Yellow
Write-Host "   - Go to https://supabase.com" -ForegroundColor White
Write-Host "   - Create a new project" -ForegroundColor White
Write-Host "   - Copy the connection string" -ForegroundColor White
Write-Host "   - Update DATABASE_URL in .env" -ForegroundColor White
Write-Host ""
Write-Host "3. Initialize the database:" -ForegroundColor Yellow
Write-Host "   Run: npx prisma generate" -ForegroundColor White
Write-Host "   Run: npx prisma db push" -ForegroundColor White
Write-Host ""
Write-Host "4. Start the development server:" -ForegroundColor Yellow
Write-Host "   Run: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see SETUP.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Installation complete! ✓" -ForegroundColor Green
