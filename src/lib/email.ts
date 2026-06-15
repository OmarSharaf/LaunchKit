import { Resend } from 'resend'
import { APP_NAME, EMAIL_FROM, SUPPORT_EMAIL } from '@/lib/site'
import { logger } from '@/lib/logger'

const resendApiKey = process.env.RESEND_API_KEY
const fromAddress = process.env.EMAIL_FROM ?? EMAIL_FROM

function getClient() {
  if (!resendApiKey) return null
  return new Resend(resendApiKey)
}

export async function sendInvitationEmail({
  to,
  organizationName,
  inviteUrl,
  inviterName,
}: {
  to: string
  organizationName: string
  inviteUrl: string
  inviterName?: string | null
}) {
  const client = getClient()
  if (!client) {
    // local dev without Resend — invite still works, link is in the API response
    logger.warn('RESEND_API_KEY not set; skipping invitation email', { to })
    return { skipped: true as const }
  }

  const inviter = inviterName ?? 'A team member'

  await client.emails.send({
    from: fromAddress,
    to,
    subject: `You're invited to join ${organizationName} on ${APP_NAME}`,
    html: `
      <p>${inviter} invited you to join <strong>${organizationName}</strong> on ${APP_NAME}.</p>
      <p><a href="${inviteUrl}">Accept invitation</a></p>
      <p>This link expires in 7 days. If you did not expect this email, you can ignore it.</p>
      <p>Questions? Contact ${SUPPORT_EMAIL}</p>
    `,
  })

  return { sent: true as const }
}
