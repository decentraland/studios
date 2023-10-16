import type { NextRequest } from 'next/server'
import { budgetToRanges } from '../../../components/utils'

export const config = {
    runtime: 'experimental-edge',
}


export default async function (req: NextRequest) {

    const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
    const API_TOKEN = process.env.API_ACCESS_TOKEN

    const user = req.cookies.get("auth")?.value
    if (!user) return new Response(null, { status: 401 })

    const authorization = JSON.parse(user).access_token

    const { job_id } = await req.json()

    try {

        const currentUser = await fetch(`${DB_URL}/users/me?fields=id,email,first_name,last_name`, {
            headers: {
                'Authorization': `Bearer ${authorization}`
            }
        }).then(res => res.ok && res.json()).then(res => res.data && res.data)

        const jobData = currentUser && await fetch(`${DB_URL}/items/jobs/${job_id}`, {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`
            }
        })
            .then(res => res.ok && res.json())
            .then(body => body.data)

        if (!currentUser || !jobData) return new Response(null, { status: 400 })

        let managers_invites = JSON.parse(jobData.managers_invites || '[]')
        let managers = JSON.parse(jobData.managers || '[]')

        if (!managers_invites.includes(currentUser.email)) {
            return new Response(null, { status: 400 })
        }

        managers_invites = managers_invites.filter((email: string) => email != currentUser.email)
        managers.push({id: currentUser.id})

        const jobUpdate = jobData && await fetch(`${DB_URL}/items/jobs/${job_id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify({
                managers_invites,
                managers
            })
        }).then(res => res.ok && res.json()).then(body => body.data)
        if (jobUpdate) return new Response(null, { status: 204 })

        return new Response(null, { status: 400 })

    } catch (error) {
        console.log('API Manage Submit error: ', error)
        return new Response(null, { status: 400 })
    }
}
