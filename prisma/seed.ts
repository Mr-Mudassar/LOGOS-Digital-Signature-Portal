import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean up existing data
  console.log('🗑️  Cleaning existing data...')
  await prisma.signature.deleteMany()
  await prisma.contract.deleteMany()
  await prisma.user.deleteMany()
  console.log('Database cleaned')

  // Create admin user
  const hashedPassword = await bcrypt.hash('Password@123', 10)

  const admin = await prisma.user.create({
    data: {
      email: 'admin1@yopmail.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log('Created admin user')
  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
