import type { NextRequest } from 'next/server'

export const config = {
    runtime: 'experimental-edge',
}

const API_TOKEN = process.env.API_ACCESS_TOKEN
const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

export default async function (req: NextRequest) {

    const body = await req.json()

    fetch(`${DB_URL}/items/test_messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_TOKEN}`
        },
        body: JSON.stringify({msg_body: body})
    })

    return new Response()

}
