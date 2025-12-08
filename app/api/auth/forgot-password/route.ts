import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Don't reveal if user exists
    if (!user) {
      return NextResponse.json(
        { message: 'If an account exists, a password reset link has been sent' },
        { status: 200 }
      )
    }

    // Create reset token
    const token = nanoid(32)
    const expiresAt = new Date(Date.now() + 3600000) // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    })

    // Send email
    const resetUrl = `${process.env.APP_URL}/auth/reset-password?token=${token}`

    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || '',
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    }

    await sgMail.send(msg)

    return NextResponse.json(
      { message: 'If an account exists, a password reset link has been sent' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
