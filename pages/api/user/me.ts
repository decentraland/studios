import type { NextRequest } from 'next/server'

export const config = {
    runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

export default async function (req: NextRequest) {
    const user = req.cookies.get("auth")?.value

    if (!user) return new Response(null, { status: 401 })

    const authorization = JSON.parse(user).access_token

    return fetch(`${DB_URL}/users/me?fields=id,email,first_name,last_name,role.name,company`, {
        headers: {
            'Authorization': `Bearer ${authorization}`
        }
    })
}