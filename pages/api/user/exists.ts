import type { NextRequest } from 'next/server'

export const config = {
    runtime: 'experimental-edge',
}

const API_TOKEN = process.env.API_ACCESS_TOKEN
const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

export default async function (req: NextRequest) {
    const { email } = await req.json()

    let getUser = await fetch(`${DB_URL}/users?filter[email]=${encodeURIComponent(email)}`, {
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
        }
    })
        .then(res => res.json())

    if (getUser.data.length) return new Response(null, { status: 204 })

    return new Response(null, { status: 404 })

}