import { createVerificationToken } from './security'

const SENDRGRID_URL = process.env.NEXT_PUBLIC_API_SENDGRID
const SENDGRID_ACCESS_TOKEN = process.env.SENDGRID_ACCESS_TOKEN
const VERIFY_EMAIL_TEMPLATE_ID = 'd-6e4af1c34f6d432bb18b09bf778cae3e'

interface UnverifiedUser {
  id: string
  email: string
  first_name?: string
  last_name?: string
  company?: string
}

/**
 * Sends the email with the link that verifies a new (draft) user. Resolves whether SendGrid accepted it.
 */
export async function sendUserVerificationEmail({ id, email, first_name, last_name, company }: UnverifiedUser) {
  const token = await createVerificationToken('user', id)

  const res = await fetch(`${SENDRGRID_URL}/mail/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SENDGRID_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      from: {
        email: "studios@decentraland.org", name: "Decentraland Studios"
      },
      personalizations: [{
        to: [
          { email, name: first_name }
        ],
        dynamic_template_data: {
          first_name,
          last_name,
          company,
          email,
          verify_url: `https://studios.decentraland.org/user/verify?id=${id}#token=${token}`,
        }
      }],
      template_id: VERIFY_EMAIL_TEMPLATE_ID
    })
  })
  await res.body?.cancel()

  return res.ok
}
