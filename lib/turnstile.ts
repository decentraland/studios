import type { NextRequest } from 'next/server'

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY
const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

// Optional comma-separated allow-list. When unset the hostname isn't checked, so local dev and previews keep working.
const ALLOWED_HOSTNAMES = (process.env.TURNSTILE_ALLOWED_HOSTNAMES || '')
  .split(',')
  .map((hostname) => hostname.trim().toLowerCase())
  .filter(Boolean)

// Cloudflare's published test secrets (always pass / always fail / token already spent) don't report the real action
// or hostname, so those checks only apply to real keys.
const IS_TEST_SECRET = /^[123]x0{31}AA$/.test(TURNSTILE_SECRET_KEY || '')

export type TurnstileAction = 'login' | 'user-exists' | 'signup' | 'resend' | 'contact' | 'review' | 'landing' | 'job'

// Distinguishable from other 400s, so forms can report a failed security check instead of a generic error
export function turnstileRejected() {
  return new Response(JSON.stringify({ errors: [{ message: 'captcha' }] }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  })
}

export function getClientIp(req: NextRequest) {
  return req.headers.get('cf-connecting-ip') ?? undefined
}

/**
 * Validates a Cloudflare Turnstile token issued for `expectedAction`. Tokens are single-use, so the client must reset
 * its widget after every request that sends one. Any failure (missing secret, network error) counts as invalid.
 */
export async function verifyTurnstile(token: unknown, ip: string | undefined, expectedAction: TurnstileAction): Promise<boolean> {
  if (typeof token !== 'string' || !token || token.length > 2048 || !TURNSTILE_SECRET_KEY) return false

  const body = new URLSearchParams({ secret: TURNSTILE_SECRET_KEY, response: token })
  if (ip) body.append('remoteip', ip)

  try {
    const res = await fetch(SITEVERIFY_URL, { method: 'POST', body })
    if (!res.ok) {
      await res.body?.cancel()
      return false
    }
    const outcome = await res.json()
    if (outcome?.success !== true) return false
    if (IS_TEST_SECRET) return true
    if (outcome.action !== expectedAction) return false
    if (ALLOWED_HOSTNAMES.length && !ALLOWED_HOSTNAMES.includes(`${outcome.hostname}`.toLowerCase())) return false
    return true
  } catch {
    return false
  }
}
