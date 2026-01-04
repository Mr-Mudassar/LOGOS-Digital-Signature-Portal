require('dotenv').config()
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

async function setupDatabase() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    console.error('✗ DATABASE_URL environment variable is not set!')
    console.error('Please check your .env file.')
    process.exit(1)
  }

  console.log('Using connection string:', connectionString.replace(/:[^:@]+@/, ':****@'))

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  try {
    console.log('🚀 Setting up AWS RDS database...\n')
    console.log('📡 Connecting to database...')

    const client = await pool.connect()
    console.log('✓ Connected successfully!\n')

    console.log('📋 Creating database schema...\n')

    // Create the schema SQL
    const sql = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enums
DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'AWAITING_SIGNATURE', 'COMPLETED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "MDACategory" AS ENUM ('HOUSING', 'LAND', 'CIVIL_SERVICE_COMMISSION', 'MINISTRY_OF_JUSTICE', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "SignatureType" AS ENUM ('INITIATOR', 'RECEIVER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "name" TEXT,
  "lasrraNumber" TEXT UNIQUE,
  "password" TEXT NOT NULL,
  "role" "UserRole" DEFAULT 'USER' NOT NULL,
  "emailVerified" TIMESTAMP,
  "image" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL
);

-- Create contracts table
CREATE TABLE IF NOT EXISTS "contracts" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "status" "ContractStatus" DEFAULT 'DRAFT' NOT NULL,
  "category" "MDACategory" DEFAULT 'OTHER' NOT NULL,
  "referenceDocumentUrl" TEXT,
  "referenceDocumentName" TEXT,
  "userContext" TEXT,
  "aiGeneratedContent" TEXT,
  "finalDocumentUrl" TEXT,
  "pdfUrl" TEXT,
  "initiatorId" TEXT NOT NULL,
  "initiatorName" TEXT NOT NULL,
  "initiatorEmail" TEXT,
  "initiatorLasrraNumber" TEXT,
  "receiverId" TEXT,
  "receiverName" TEXT NOT NULL,
  "receiverEmail" TEXT NOT NULL,
  "receiverLasrraNumber" TEXT,
  "signingLink" TEXT UNIQUE,
  "signingLinkExpiresAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,
  "completedAt" TIMESTAMP,
  FOREIGN KEY ("initiatorId") REFERENCES "users"("id") ON DELETE CASCADE,
  FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Create signatures table
CREATE TABLE IF NOT EXISTS "signatures" (
  "id" TEXT PRIMARY KEY,
  "contractId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "SignatureType" NOT NULL,
  "signatureData" TEXT NOT NULL,
  "signedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "ipAddress" TEXT,
  FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE,
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL,
  "token" TEXT UNIQUE NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "contracts_initiatorId_idx" ON "contracts"("initiatorId");
CREATE INDEX IF NOT EXISTS "contracts_receiverId_idx" ON "contracts"("receiverId");
CREATE INDEX IF NOT EXISTS "contracts_status_idx" ON "contracts"("status");
CREATE INDEX IF NOT EXISTS "signatures_contractId_idx" ON "signatures"("contractId");
CREATE INDEX IF NOT EXISTS "signatures_userId_idx" ON "signatures"("userId");
CREATE INDEX IF NOT EXISTS "password_reset_tokens_email_idx" ON "password_reset_tokens"("email");

    `

    await client.query(sql)
    console.log('✓ Database schema created successfully!\n')

    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)

    console.log('📊 Created tables:')
    result.rows.forEach((row) => console.log(`   ✓ ${row.table_name}`))

    console.log('\n🎉 Your AWS RDS database is now ready to use!')

    client.release()
  } catch (error) {
    console.error('\n✗ Error:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

setupDatabase()
