const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
const { execSync } = require('child_process')

async function setupDatabase() {
  console.log('🚀 Setting up AWS RDS database...\n')

  // Test connection first
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  try {
    console.log('📡 Testing database connection...')
    const client = await pool.connect()
    console.log('✓ Successfully connected to AWS RDS!\n')
    client.release()

    console.log('📋 Pushing Prisma schema to database...')
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      env: process.env,
    })

    console.log('\n✓ Database schema created successfully!')
    console.log('\n🎉 Your AWS RDS database is now ready to use!')
  } catch (error) {
    console.error('\n✗ Error setting up database:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

setupDatabase()
