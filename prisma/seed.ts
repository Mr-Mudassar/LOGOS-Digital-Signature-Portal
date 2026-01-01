import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

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
  })
