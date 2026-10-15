import type { NextRequest } from 'next/server'
import { isEmail, readJson } from '../../../lib/security'
import { getClientIp, turnstileRejected, verifyTurnstile } from '../../../lib/turnstile'

export const config = {
    runtime: 'experimental-edge',
}

const API_TOKEN = process.env.API_ACCESS_TOKEN
const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

export default async function (req: NextRequest) {
    if (req.method !== 'POST') return new Response(null, { status: 400 })

    const { email, turnstileToken } = await readJson(req)

    if (!await verifyTurnstile(turnstileToken, getClientIp(req), 'user-exists')) return turnstileRejected()

    if (!isEmail(email)) return new Response(null, { status: 400 })

    let getUser = await fetch(`${DB_URL}/users?filter[email][_eq]=${encodeURIComponent(email)}`, {
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
        }
    })
        .then(res => res.json())

    if (getUser.data?.length) return new Response(null, { status: 204 })

    return new Response(null, { status: 404 })

}