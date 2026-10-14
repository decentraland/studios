import type { NextRequest } from 'next/server'
import { User } from '../../../interfaces/User'
import { isUUID } from '../../../components/utils'
import { getAccessToken, isSameOrigin } from '../../../lib/security'

export const config = {
    runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const API_TOKEN = process.env.API_ACCESS_TOKEN


const isParticipant = async (conversationId: string, user: User) => {
    const conversation = await fetch(`${DB_URL}/items/conversations/${conversationId}?fields=user_created,related_job.email,related_job.managers`, {
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`
        }
    })
        .then(res => res.ok && res.json())
        .then(body => body && body.data)

    if (!conversation) return false
    if (conversation.user_created === user.id || conversation.related_job?.email === user.email) return true

    const managers = JSON.parse(conversation.related_job?.managers || '[]') as User[]
    return managers.some(manager => manager.id === user.id)
}

export default async function (req: NextRequest) {
    const authorization = getAccessToken(req)

    if (!authorization) return new Response(null, { status: 401 })

    if (req.method === 'POST' && isSameOrigin(req)) {

        const conversation_id = req.nextUrl.searchParams.get('conversation_id')
        const messageId = req.nextUrl.searchParams.get('message')

        if (!isUUID(conversation_id || '') || !messageId || !/^[\w-]{1,64}$/.test(messageId)) {
            return new Response(null, { status: 400 })
        }

        const currentUser = await fetch(`${DB_URL}/users/me?fields=id,email`, {
            headers: {
                'Authorization': `Bearer ${authorization}`
            }
        })
            .then(res => res.ok && res.json())
            .then(body => body && body.data) as User

        if (!currentUser || !(await isParticipant(conversation_id as string, currentUser))) return new Response(null, { status: 403 })

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

    return new Response(null, { status: 400 })
}