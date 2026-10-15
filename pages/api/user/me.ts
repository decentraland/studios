import type { NextRequest } from 'next/server'
import { getAccessToken } from '../../../lib/security'

export const config = {
    runtime: 'edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

export default async function (req: NextRequest) {
    const authorization = getAccessToken(req)

    if (!authorization) return new Response(null, { status: 401 })

    return fetch(`${DB_URL}/users/me?fields=id,email,first_name,last_name,role.name,company`, {
        headers: {
            'Authorization': `Bearer ${authorization}`
        }
    })
}
