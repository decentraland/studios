import { createVerificationToken, readJsonResponse } from './security'

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const API_TOKEN = process.env.API_ACCESS_TOKEN

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

/**
 * Updates a user only while it still has `status`. Resolves whether exactly that user was updated.
 */
async function updateUserWithStatus(id: string, status: string, data: Record<string, unknown>) {
  const updated = await fetch(`${DB_URL}/users?fields=id`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`
    },
    body: JSON.stringify({
      query: {
        filter: {
          _and: [
            { id: { _eq: id } },
            { status: { _eq: status } }
          ]
        }
      },
      data
    })
  }).then(readJsonResponse)

  const items = updated?.data
  return Array.isArray(items) && items.length === 1 && items[0]?.id === id
}

/**
 * Sets the password of a draft user and activates it. The update is conditional on the user still being a draft, so a
 * suspension (or any other status change) made after the caller read the status is never overridden.
 * Resolves whether exactly that user was updated.
 */
export async function activateDraftUser(id: string, password: string) {
  const activated = await updateUserWithStatus(id, 'draft', { password, status: 'active' })
  if (!activated) console.log('Draft user activation matched no draft user ', id)

  return activated
}

/**
 * Suspends a draft user, so it can't be activated anymore, before it's removed. Conditional on the user still being a
 * draft, so an account activated meanwhile is never touched. Resolves whether exactly that user was suspended.
 */
export function suspendDraftUser(id: string) {
  return updateUserWithStatus(id, 'draft', { status: 'suspended' })
}

/**
 * Undoes `suspendDraftUser` when removing the user failed. Resolves whether exactly that user was restored.
 */
export function restoreSuspendedDraftUser(id: string) {
  return updateUserWithStatus(id, 'suspended', { status: 'draft' })
}

/**
 * Deletes a user. Resolves whether Directus accepted it.
 */
export async function deleteUser(id: string) {
  const res = await fetch(`${DB_URL}/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`
    }
  })
  await res.body?.cancel()

  return res.ok
}

/**
 * Reads the status of a user, or undefined when it can't be read. Used after `activateDraftUser` matched nothing, to
 * tell an account activated meanwhile (another tab, a retried request) from one that was suspended or removed.
 */
export async function getUserStatus(id: string): Promise<string | undefined> {
  const user = await fetch(`${DB_URL}/users/${id}?fields=status`, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`
    }
  }).then(readJsonResponse).then(res => res?.data)

  return typeof user?.status === 'string' ? user.status : undefined
}
