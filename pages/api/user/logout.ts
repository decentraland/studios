import type { NextRequest } from 'next/server'

export const config = {
  runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

export default async function (req: NextRequest) {

    // const refresh_token = JSON.parse(req.cookies.get('auth')?.value || '').refresh_token

    const user = req.cookies.get("auth")?.value || ''

    if (!user) return new Response(null, { status: 401 })

    const authorization = JSON.parse(user).access_token
    const refresh_token = JSON.parse(user).refresh_token

    return  fetch(`${DB_URL}/auth/logout`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authorization}`

        },
        body: JSON.stringify({refresh_token}),
    })
  }