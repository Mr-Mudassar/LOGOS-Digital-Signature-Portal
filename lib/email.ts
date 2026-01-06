import axios from 'axios'

/**
 * Get Microsoft Graph API access token
 */
async function getAccessToken(): Promise<string> {
  const TENANT_ID = process.env.MS_GRAPH_TENANT_ID
  const CLIENT_ID = process.env.MS_GRAPH_CLIENT_ID
  const CLIENT_SECRET = process.env.MS_GRAPH_CLIENT_SECRET

  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Missing Microsoft Graph API credentials')
  }

  const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`

  const params = new URLSearchParams()
  params.append('client_id', CLIENT_ID)
  params.append('client_secret', CLIENT_SECRET)
  params.append('scope', 'https://graph.microsoft.com/.default')
  params.append('grant_type', 'client_credentials')

  try {
    const response = await axios.post(tokenUrl, params)
    return response.data.access_token
  } catch (error) {
    console.error('Failed to get Microsoft Graph access token:', error)
    throw new Error('Failed to authenticate with Microsoft Graph API')
  }
}

/**
 * Send email using Microsoft Graph API
 */
async function sendGraphEmail(to: string, subject: string, html: string): Promise<void> {
  const accessToken = await getAccessToken()
  const senderEmail = process.env.MS_GRAPH_SENDER_EMAIL

  if (!senderEmail) {
    throw new Error('Missing MS_GRAPH_SENDER_EMAIL environment variable')
  }

  const emailPayload = {
    message: {
      subject,
      body: {
        contentType: 'HTML',
        content: html,
      },
      toRecipients: [
        {
          emailAddress: {
            address: to,
          },
        },
      ],
    },
    saveToSentItems: true,
  }

  try {
    await axios.post(
      `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`,
      emailPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )
    console.log(`Email sent successfully to ${to}`)
  } catch (error: any) {
    console.error('Microsoft Graph API error:', error.response?.data || error.message)
    throw new Error('Failed to send email via Microsoft Graph API')
  }
}

interface SendContractInvitationParams {
  receiverEmail: string
  receiverName: string
  initiatorName: string
  contractTitle: string
  contractId: string
}

interface SendContractCompletionParams {
  initiatorEmail: string
  receiverEmail: string
  initiatorName: string
  receiverName: string
  contractTitle: string
}

/**
 * Send contract invitation email to receiver
 */
export async function sendContractInvitation(params: SendContractInvitationParams) {
  const { receiverEmail, receiverName, initiatorName, contractTitle, contractId } = params
  const signingUrl = `${process.env.APP_URL}/contracts/${contractId}`

  const emailHtml = `
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
                  <div style="font-size: 48px; margin-bottom: 12px;">📝</div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                    Lagos State Digital Signature Portal
                  </h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px; font-weight: 600;">
                    Hello ${receiverName},
                  </h2>
                  <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    You have been invited to sign a contract by <strong>${initiatorName}</strong>.
                  </p>

                  <!-- Contract Info Box -->
                  <div style="background-color: #f9fafb; border-left: 4px solid #10B981; padding: 16px; margin: 24px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Contract Title
                    </p>
                    <p style="margin: 8px 0 0; color: #111827; font-size: 16px; font-weight: 500;">
                      ${contractTitle}
                    </p>
                  </div>

                  <p style="margin: 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Please review the contract and provide your digital signature to complete the agreement.
                  </p>

                  <!-- Sign Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                    <tr>
                      <td align="center">
                        <a href="${signingUrl}" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);">
                          Review and Sign Contract
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 24px 0 8px; color: #6b7280; font-size: 14px;">
                    Or copy and paste this link into your browser:
                  </p>
                  <p style="margin: 0; color: #10B981; font-size: 14px; word-break: break-all;">
                    ${signingUrl}
                  </p>

                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

                  <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                    This signing link will expire in 30 days. If you have any questions, please contact ${initiatorName}.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #6b7280; font-size: 12px;">
                    © ${new Date().getFullYear()} Lagos State Digital Signature Portal. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  await sendGraphEmail(receiverEmail, `Contract Ready for Signature: ${contractTitle}`, emailHtml)
}

/**
 * Send contract completion email to both parties
 */
export async function sendContractCompletion(params: SendContractCompletionParams) {
  const { initiatorEmail, receiverEmail, initiatorName, receiverName, contractTitle } = params

  const emailTemplate = (recipientName: string, otherPartyName: string) => `
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
                  <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                    Contract Completed!
                  </h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px; font-weight: 600;">
                    Hello ${recipientName},
                  </h2>
                  <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Great news! The contract has been successfully signed by all parties.
                  </p>

                  <!-- Contract Info Box -->
                  <div style="background-color: #f0fdf4; border-left: 4px solid #10B981; padding: 16px; margin: 24px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Contract Title
                    </p>
                    <p style="margin: 8px 0 0; color: #111827; font-size: 16px; font-weight: 500;">
                      ${contractTitle}
                    </p>
                  </div>

                  <!-- Parties Info -->
                  <div style="background-color: #f9fafb; padding: 20px; margin: 24px 0; border-radius: 6px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding-right: 12px;">
                          <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            First Party
                          </p>
                          <p style="margin: 0; color: #111827; font-size: 15px; font-weight: 500;">
                            ${initiatorName}
                          </p>
                          <p style="margin: 4px 0 0; color: #10B981; font-size: 13px;">
                            ✓ Signed
                          </p>
                        </td>
                        <td width="50%" style="padding-left: 12px;">
                          <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Second Party
                          </p>
                          <p style="margin: 0; color: #111827; font-size: 15px; font-weight: 500;">
                            ${receiverName}
                          </p>
                          <p style="margin: 4px 0 0; color: #10B981; font-size: 13px;">
                            ✓ Signed
                          </p>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <p style="margin: 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    The digitally signed contract is now legally binding and has been securely stored in the Lagos State Digital Signature Portal.
                  </p>

                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

                  <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                    You can access your signed contracts anytime by logging into your dashboard at the Lagos State Digital Signature Portal.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #6b7280; font-size: 12px;">
                    © ${new Date().getFullYear()} Lagos State Digital Signature Portal. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  try {
    // Send to initiator
    await sendGraphEmail(
      initiatorEmail,
      `Contract Completed: ${contractTitle}`,
      emailTemplate(initiatorName, receiverName)
    )

    // Send to receiver
    await sendGraphEmail(
      receiverEmail,
      `Contract Completed: ${contractTitle}`,
      emailTemplate(receiverName, initiatorName)
    )
  } catch (err) {
    console.error('Microsoft Graph API ERROR:', err)
    throw new Error('Email send failed')
  }
}
