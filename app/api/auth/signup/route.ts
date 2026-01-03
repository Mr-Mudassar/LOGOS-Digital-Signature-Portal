import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
  lasrraNumber: z
    .string()
    .min(10, 'LASRRA Number must be at least 10 characters')
    .max(20, 'LASRRA Number must not exceed 20 characters')
    .regex(
      /^[A-Z0-9-]+$/,
      'LASRRA Number must contain only uppercase letters, numbers, and hyphens'
    ),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, lasrraNumber } = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    // Check if LASRRA Number already exists
    const existingLasrra = await prisma.user.findUnique({
      where: { lasrraNumber },
    })

    if (existingLasrra) {
      return NextResponse.json(
        { error: 'User with this LASRRA Number already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        lasrraNumber,
      },
      select: {
        id: true,
        email: true,
        name: true,
        lasrraNumber: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ message: 'User created successfully', user }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Signup error:', error)
    return NextResponse.json({ error: 'An error occurred during signup' }, { status: 500 })
  }
}
