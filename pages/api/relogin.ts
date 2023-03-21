import type { NextRequest } from 'next/server'

export const config = {
  runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

export default async function (req: NextRequest) {
    // const body = await req.json()

    const refresh_token = JSON.parse(req.cookies.get('currentUser')?.value || '').refresh_token

    return  fetch(`${DB_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({refresh_token}),
    })
  }