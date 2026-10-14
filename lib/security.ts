import type { NextRequest } from 'next/server'

const VERIFICATION_TOKEN_SECRET = process.env.VERIFICATION_TOKEN_SECRET

const EMAIL_REGEX = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]+$/

export const VERIFICATION_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000

export function isEmail(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 254 && EMAIL_REGEX.test(value)
}

export function isBoundedString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.length <= maxLength
}

export function pick<T extends object, K extends string>(source: T, keys: readonly K[]) {
  const result: Record<string, unknown> = {}
  for (const key of keys) {
    if (source && Object.prototype.hasOwnProperty.call(source, key)) {
      result[key] = (source as Record<string, unknown>)[key]
    }
  }
  return result as Partial<Record<K, unknown>>
}

export async function readJson(req: NextRequest) {
  try {
    const body = await req.json()
    return body && typeof body === 'object' ? body : {}
  } catch {
    return {}
  }
}

/**
 * Returns the session stored in the `auth` cookie, or undefined when it is missing or malformed.
 */
export function getSession(req: NextRequest): { access_token?: string, refresh_token?: string } | undefined {
  const value = req.cookies.get('auth')?.value
  if (!value) return undefined
  try {
    const session = JSON.parse(value)
    return session && typeof session === 'object' ? session : undefined
  } catch {
    return undefined
  }
}

export function getAccessToken(req: NextRequest) {
  const token = getSession(req)?.access_token
  return typeof token === 'string' && token ? token : undefined
}

/**
 * CSRF guard for cookie-authenticated routes: rejects requests whose Origin (or Referer)
 * points to a different host than the one serving the request.
 */
export function isSameOrigin(req: NextRequest) {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host')
  const source = req.headers.get('origin') || req.headers.get('referer')
  if (!source) return req.method === 'GET' || req.method === 'HEAD'
  try {
    return new URL(source).host === host
  } catch {
    return false
  }
}

export function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

function toBase64Url(buffer: ArrayBuffer) {
  let binary = ''
  for (const byte of new Uint8Array(buffer)) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function hmac(message: string) {
  if (!VERIFICATION_TOKEN_SECRET) throw new Error('VERIFICATION_TOKEN_SECRET is not configured')
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(VERIFICATION_TOKEN_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return toBase64Url(await crypto.subtle.sign('HMAC', key, encoder.encode(message)))
}

/**
 * Creates an expiring token that proves the holder received a link sent to them by email.
 * `purpose` scopes the token so a user verification token can't be replayed against a job or review.
 */
export async function createVerificationToken(purpose: 'user' | 'job' | 'review', id: string, ttl = VERIFICATION_TOKEN_TTL) {
  const expiresAt = Date.now() + ttl
  return `${expiresAt}.${await hmac(`${purpose}:${id}:${expiresAt}`)}`
}

export async function isValidVerificationToken(purpose: 'user' | 'job' | 'review', id: string, token: unknown) {
  if (typeof token !== 'string') return false
  const [expiresAt, signature] = token.split('.')
  if (!expiresAt || !signature || !/^\d+$/.test(expiresAt) || Number(expiresAt) < Date.now()) return false
  return timingSafeEqual(signature, await hmac(`${purpose}:${id}:${expiresAt}`))
}
