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
      select: { email: true, role: true, name: true },
    })

    // Don't reveal if user exists, but prevent admin password resets
    if (!user) {
      return NextResponse.json(
        { message: 'If an account exists, a password reset link has been sent' },
        { status: 200 }
      )
    }

    // Prevent admin password resets
    if (user.role === 'ADMIN') {
      return NextResponse.json(
        {
          error:
            'Admin accounts cannot reset passwords through this method. Please contact system administrator.',
        },
        { status: 403 }
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
      subject: 'Password Reset Request - MOWU Digital Signature',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px; text-align: center;">
                      <div style="font-size: 48px; margin-bottom: 12px;">🔐</div>
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                        Password Reset Request
                      </h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px; font-weight: 600;">
                        Hello${user.name ? ' ' + user.name : ''},
                      </h2>
                      <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        We received a request to reset your password for your Lagos State Digital Signature Portal account.
                      </p>

                      <!-- Info Box -->
                      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                          <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour for your security.
                        </p>
                      </div>

                      <p style="margin: 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Click the button below to create a new password:
                      </p>

                      <!-- Reset Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                        <tr>
                          <td align="center">
                            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);">
                              Reset Your Password
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 24px 0 8px; color: #6b7280; font-size: 14px;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="margin: 0; color: #10B981; font-size: 14px; word-break: break-all; background-color: #f3f4f6; padding: 12px; border-radius: 4px;">
                        ${resetUrl}
                      </p>

                      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

                      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.5;">
                          <strong>Didn't request this?</strong><br>
                          If you didn't request a password reset, please ignore this email or contact support if you have concerns about your account security.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px;">
                        © ${new Date().getFullYear()} Lagos State Digital Signature Portal. All rights reserved.
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                        This is an automated email, please do not reply.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
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
