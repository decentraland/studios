import type { NextRequest } from 'next/server'
import Partners from '../../../clients/Partners'
import { User } from '../../../interfaces/User'
import { Job } from '../../../interfaces/Job'
import { getAccessToken, normalizeEmail, readJsonResponse } from '../../../lib/security'
import { getUsersBy } from '../../../lib/users'

export const config = {
    runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const API_TOKEN = process.env.API_ACCESS_TOKEN

export default async function (req: NextRequest) {
    const authorization = getAccessToken(req)

    if (!authorization) return new Response(null, { status: 401 })


    if (req.method === 'GET') {

        const currentUser = await fetch(`${DB_URL}/users/me?fields=status,id,email`, {
            headers: {
                'Authorization': `Bearer ${authorization}`
            }
        }).then(readJsonResponse).then(res => res?.data)

        if (!currentUser || currentUser.status !== 'active') return new Response(null, { status: 401 })

        const jobs = await fetch(`${DB_URL}/items/jobs`, {
            method: "SEARCH",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify({
                "query": {
                    // Without an explicit limit Directus returns at most 100 rows
                    "limit": -1,
                    "filter": {
                        "_or": [
                            {
                                "_and": [
                                    { "email": { "_nnull": true } },
                                    { "email": { "_eq": currentUser.email } }
                                ]
                            },
                            {
                                "_and": [
                                    { "managers": { "_nnull": true } },
                                    { "managers": { "_contains": currentUser.id } }
                                ]
                            }
                        ]
                    },
                    "fields": [
                        '*',
                        "brief_file.id",
                        "brief_file.filename_download",
                        "messages.*"
                    ]
                }
            }
            )
        })
            .then(readJsonResponse)
            .then((res) => (res?.data || []) as Job[])

            let conversations = []

        if (jobs.length) {

            for (const job of jobs) {
                job.managers = JSON.parse((job.managers as any) || "[]")
            }

            // One lookup per batch of users instead of one per job and per manager, to stay under the subrequest limit.
            // Directus filters are case-sensitive, so the normalized job email is looked up next to the stored one.
            const jobEmails = jobs.map(job => job.email).filter(email => typeof email === 'string')
            const [authors, managersData] = await Promise.all([
                getUsersBy('email', [...jobEmails, ...jobEmails.map(normalizeEmail)], 'id,email', API_TOKEN),
                getUsersBy('id', jobs.flatMap(job => (job.managers as unknown[]).map((manager: any) => manager?.id)), 'id,email,first_name,last_name', API_TOKEN)
            ])

            const authorIdsByEmail = new Map<string, string>()
            const authorIdsByNormalizedEmail = new Map<string, string>()
            for (const author of authors) {
                if (!authorIdsByEmail.has(author.email)) authorIdsByEmail.set(author.email, author.id)
                if (!authorIdsByNormalizedEmail.has(normalizeEmail(author.email))) authorIdsByNormalizedEmail.set(normalizeEmail(author.email), author.id)
            }
            const managersById = new Map(managersData.map(manager => [manager.id, manager as User]))

            for (const job of jobs) {
                job.author_id = authorIdsByEmail.get(job.email) || (normalizeEmail(job.email) ? authorIdsByNormalizedEmail.get(normalizeEmail(job.email)) : undefined)

                // Deleted managers are skipped
                job.managers = job.managers
                    .map((manager: any) => managersById.get(manager?.id))
                    .filter((manager): manager is User => !!manager)
            }

            conversations = await fetch(`${DB_URL}/items/conversations`, {
                method: "SEARCH",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_TOKEN}`
                },
                body: JSON.stringify({
                    query: {
                        limit: -1,
                        filter: {
                            "_and":
                                [
                                    {
                                        "related_job": {
                                            "_in": jobs.map(job => job.id)
                                        }
                                    },
                                    {
                                        "related_job": {
                                            "_nnull": true
                                        }
                                    },
                                    {
                                        "status": {
                                            "_eq": "published"
                                        }
                                    },
                                ]

                        },
                        
                        fields: [
                            "id",
                            "title",
                            "related_job",
                            "user_created",
                            "messages.id",
                            "messages.date_created",
                            "messages.message",
                            "messages.attachments.directus_files_id.id",
                            "messages.attachments.directus_files_id.filename_download",
                            "messages.author.first_name",
                            "messages.author.last_name",
                            "messages.author.id",
                            "conversations_users.*"
                        ]
                    }
                }

                )
            })
                .then(readJsonResponse)
                .then(body => body?.data || [])
            const studios = await Partners.getPartnersByUsers(conversations.map((conversation: any) => conversation.user_created), 'name,logo,user,slug')

            for (const conversation of conversations) {
                conversation.studio_data = studios.get(conversation.user_created)

                if (conversation.conversations_users?.length) {
                    conversation.last_read_message = conversation.conversations_users.find((item: any) => item.directus_users_id === currentUser.id)?.last_read_message
                }
            }
        }

        return new Response(JSON.stringify({ jobs, conversations }))
    }

    return new Response(null, { status: 400 })
}