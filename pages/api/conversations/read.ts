import type { NextRequest } from 'next/server'
import { User } from '../../../interfaces/User'
import { isUUID } from '../../../components/utils'

export const config = {
    runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const API_TOKEN = process.env.API_ACCESS_TOKEN


export default async function (req: NextRequest) {
    const user = req.cookies.get("auth")?.value || ''

    const authorization = JSON.parse(user).access_token

    if (req.method === 'GET') {

        const conversation_id = req.nextUrl.searchParams.get('conversation_id')
        const messageId = req.nextUrl.searchParams.get('message')

        if (!isUUID(conversation_id || '')) {
            return new Response(null, { status: 400 })
        }

        const currentUser = await fetch(`${DB_URL}/users/me?fields=id`, {
            headers: {
                'Authorization': `Bearer ${authorization}`
            }
        })
            .then(res => res.ok && res.json())
            .then(body => body.data) as User

        const updateItem = await fetch(`${DB_URL}/items/conversations_directus_users`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify({
                query: {
                    filter: {
                        "_and": [
                            { "conversations_id": { "_eq": conversation_id } },
                            { "directus_users_id": { "_eq": currentUser.id } }
                        ]
                    }
                },
                data: {
                    last_read_message: messageId,
                }
            })
        })
            .then(res => res.json())
            .then(body => body.data)

        !updateItem.length && await fetch(`${DB_URL}/items/conversations_directus_users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify({
                last_read_message: messageId,
                conversations_id: conversation_id,
                directus_users_id: currentUser.id
            })
        })

        return new Response()
    }

}