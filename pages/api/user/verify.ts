import type { NextRequest } from 'next/server'
import { isUUID } from '../../../components/utils'
import { activateDraftUser, getUserStatus } from '../../../lib/userVerification'
import { isValidPassword } from '../../../lib/password'
import { checkVerificationToken, readJson } from '../../../lib/security'

export const config = {
  runtime: 'edge',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

export default async function (req: NextRequest) {
  if (req.method !== 'POST') return new Response(null, { status: 400 })

  const { id, token, password } = await readJson(req)

  if (typeof id !== 'string' || !isUUID(id)) return new Response(null, { status: 400 })

  const tokenStatus = await checkVerificationToken('user', id, token)
  // A real link that's too old: the signup page's resend link sends a new one
  if (tokenStatus === 'expired') return new Response(null, { status: 410 })
  if (tokenStatus !== 'valid') return new Response(null, { status: 400 })

  const status = await getUserStatus(id)

  // Already verified (a reopened link): the link can't be used to change the password, so no password is needed to tell
  if (status === 'active') return jsonResponse({ alreadyActive: true })

  // Only pending sign ups can be activated: suspended or archived accounts must stay that way
  if (status !== 'draft') return new Response(null, { status: 400 })

  // Whoever proves they own the email sets the password, never whoever signed up with it
  if (password === undefined || password === null || password === '') return jsonResponse({ needsPassword: true }, 409)

  if (!isValidPassword(password)) return new Response(null, { status: 400 })

  if (await activateDraftUser(id, password)) return new Response(null, { status: 204 })

  // Activated meanwhile (e.g. from another tab): this password wasn't set, the one chosen there was
  if (await getUserStatus(id) === 'active') return jsonResponse({ alreadyActive: true })

  return new Response(null, { status: 400 })
}
