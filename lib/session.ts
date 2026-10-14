const AUTH_COOKIE = 'auth'
const AUTH_EXPIRES_COOKIE = 'auth_expires'

interface DirectusAuthData {
  access_token: string
  refresh_token: string
  expires: number
}

/**
 * Builds the response for a Directus login/refresh call. Tokens are stored in an HttpOnly cookie
 * so page scripts can't read them; the client only learns when the access token expires.
 */
export async function sessionResponse(directusResponse: Response) {
  const body = await directusResponse.json().catch(() => ({}))

  if (!directusResponse.ok || !body.data?.access_token) {
    return new Response(JSON.stringify({ errors: body.errors || [] }), {
      status: directusResponse.status >= 400 ? directusResponse.status : 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const { access_token, refresh_token, expires } = body.data as DirectusAuthData
  const expires_at = Date.now() + expires

  const headers = new Headers({ 'Content-Type': 'application/json' })
  headers.append('Set-Cookie', `${AUTH_COOKIE}=${encodeURIComponent(JSON.stringify({ access_token, refresh_token, expires_at }))}; Path=/; HttpOnly; Secure; SameSite=Lax`)
  headers.append('Set-Cookie', `${AUTH_EXPIRES_COOKIE}=${expires_at}; Path=/; Secure; SameSite=Lax`)

  return new Response(JSON.stringify({ data: { expires_at } }), { headers })
}

export function clearSessionHeaders() {
  const headers = new Headers()
  headers.append('Set-Cookie', `${AUTH_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`)
  headers.append('Set-Cookie', `${AUTH_EXPIRES_COOKIE}=; Path=/; Secure; SameSite=Lax; Max-Age=0`)
  return headers
}
