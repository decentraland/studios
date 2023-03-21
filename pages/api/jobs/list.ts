import type { NextRequest } from 'next/server'

export const config = {
  runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

export default async function (req: NextRequest) {
    const user = req.cookies.get("currentUser")?.value || ''

    const authorization = JSON.parse(user).access_token

    return fetch(`${DB_URL}/items/jobs`, {
            headers: { 
                'Authorization': `Bearer ${authorization}`
            }
        })
  }