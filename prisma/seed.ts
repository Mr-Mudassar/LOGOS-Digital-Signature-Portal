import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean up existing data (optional - comment out if you want to keep data)
  // await prisma.signature.deleteMany()
  // await prisma.contract.deleteMany()
  // await prisma.user.deleteMany()

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mowu.gov.ng' },
    update: {},
    create: {
      email: 'admin@mowu.gov.ng',
      name: 'MOWU Administrator',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  const user1 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      name: 'John Doe',
      password: hashedPassword,
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      password: hashedPassword,
    },
  })

  console.log('✓ Created admin and test users')

  // Create sample contracts
  const contract1 = await prisma.contract.create({
    data: {
      title: 'Housing Lease Agreement for Flat 3B, Yaba',
      status: 'COMPLETED',
      initiatorId: user1.id,
      initiatorName: 'John Doe',
      initiatorEmail: user1.email,
      receiverId: user2.id,
      receiverName: 'Jane Smith',
      receiverEmail: user2.email,
      userContext: 'Standard residential lease for 2-bedroom apartment',
      aiGeneratedContent: `HOUSING LEASE AGREEMENT

This Lease Agreement is made on ${new Date().toLocaleDateString()} between:

LANDLORD: John Doe
TENANT: Jane Smith

PROPERTY: Flat 3B, Yaba, Lagos State

TERMS:
1. Duration: 12 months
2. Monthly Rent: ₦500,000
3. Security Deposit: ₦1,000,000

Both parties agree to the terms stated above.`,
      completedAt: new Date(),
    },
  })

  const contract2 = await prisma.contract.create({
    data: {
      title: 'Employment Offer #778',
      status: 'AWAITING_SIGNATURE',
      initiatorId: user1.id,
      initiatorName: 'John Doe',
      initiatorEmail: user1.email,
      receiverName: 'Jane Smith',
      receiverEmail: user2.email,
      userContext: 'Full-time employment contract',
      aiGeneratedContent: `EMPLOYMENT OFFER LETTER

Dear Jane Smith,

We are pleased to offer you the position of Senior Developer.

Start Date: January 1, 2026
Salary: ₦5,000,000 per annum

Please sign below to accept this offer.`,
    },
  })

  const contract3 = await prisma.contract.create({
    data: {
      title: 'Service Contract #932',
      status: 'DRAFT',
      initiatorId: user2.id,
      initiatorName: 'Jane Smith',
      initiatorEmail: user2.email,
      receiverName: 'John Doe',
      receiverEmail: user1.email,
      userContext: 'Professional services agreement',
      aiGeneratedContent: `PROFESSIONAL SERVICES AGREEMENT

This Agreement is between:

SERVICE PROVIDER: Jane Smith
CLIENT: John Doe

SCOPE OF WORK: Web development services
DURATION: 3 months
COMPENSATION: ₦2,000,000

Terms and conditions apply.`,
    },
  })

  console.log('✓ Created sample contracts')

  // Create sample signatures for completed contract
  await prisma.signature.create({
    data: {
      contractId: contract1.id,
      userId: user1.id,
      type: 'INITIATOR',
      signatureData: 'base64-signature-data-initiator',
      ipAddress: '192.168.1.1',
    },
  })

  await prisma.signature.create({
    data: {
      contractId: contract1.id,
      userId: user2.id,
      type: 'RECEIVER',
      signatureData: 'base64-signature-data-receiver',
      ipAddress: '192.168.1.2',
    },
  })

  console.log('✓ Created sample signatures')

  console.log('🎉 Database seeded successfully!')
  console.log('\n' + '='.repeat(50))
  console.log('ADMIN ACCOUNT:')
  console.log('Email: admin@mowu.gov.ng')
  console.log('Password: password123')
  console.log('Role: ADMIN')
  console.log('='.repeat(50))
  console.log('\nTest User Accounts:')
  console.log('Email: john.doe@example.com')
  console.log('Password: password123')
  console.log('\nEmail: jane.smith@example.com')
  console.log('Password: password123')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
