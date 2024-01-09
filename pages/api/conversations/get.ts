import type { NextRequest } from 'next/server'
import Partners from '../../../clients/Partners'
import { User } from '../../../interfaces/User'
import { Job } from '../../../interfaces/Job'

export const config = {
    runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const API_TOKEN = process.env.API_ACCESS_TOKEN

export default async function (req: NextRequest) {
    const user = req.cookies.get("auth")?.value

    if (!user) return new Response(null, { status: 401 })

    const authorization = JSON.parse(user).access_token


    if (req.method === 'GET') {

        const currentUser = await fetch(`${DB_URL}/users/me?fields=status,id,email`, {
            headers: {
                'Authorization': `Bearer ${authorization}`
            }
        }).then(res => res.ok && res.json()).then(res => res.data && res.data)

        if (!currentUser || currentUser.status !== 'active') return new Response(null, { status: 401 })

        const jobs = await fetch(`${DB_URL}/items/jobs`, {
            method: "SEARCH",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify({
                "query": {
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
            .then(res => res.ok && res.json())
            .then((res) => res.data as Job[])

            let conversations = []

        if (jobs.length) {

            for (const job of jobs) {
                const jobAuthorId = await fetch(`${DB_URL}/users?filter[email]=${encodeURIComponent(job.email)}&fields=id`, {
                    headers: {
                        'Authorization': `Bearer ${API_TOKEN}`
                    }
                }).then(res => res.ok && res.json()).then(body => body.data[0].id)
                
                job.author_id = jobAuthorId

                job.managers = JSON.parse((job.managers as any) || "[]")

                const managers = [] as User[]
                for (const manager of job.managers){
                    managers.push(await fetch(`${DB_URL}/users/${manager.id}?fields=id,email,first_name,last_name`, {
                        headers: {
                            'Authorization': `Bearer ${API_TOKEN}`
                        }
                    }).then(res => res.ok && res.json()).then(body => body.data))
                }
                
                job.managers = managers

            }

            conversations = await fetch(`${DB_URL}/items/conversations`, {
                method: "SEARCH",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_TOKEN}`
                },
                body: JSON.stringify({
                    query: {
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
                .then(res => res.ok && res.json())
                .then(body => body.data)
            for (const conversation of conversations) {
                const query = { user: conversation.user_created }
                conversation.studio_data = await Partners.getPartnerData(query, 'name,logo,user,slug')

                if (conversation.conversations_users.length) {
                    conversation.last_read_message = conversation.conversations_users.find((item: any) => item.directus_users_id === currentUser.id)?.last_read_message
                }
            }
        }

        return new Response(JSON.stringify({ jobs, conversations }))
    }
}