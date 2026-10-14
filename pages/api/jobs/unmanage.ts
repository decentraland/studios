import type { NextRequest } from 'next/server'
import { getAccessToken, isSameOrigin, isSameEmail, readJson, readJsonResponse } from '../../../lib/security'
import { User } from '../../../interfaces/User'
import { isUUID } from '../../../components/utils'

export const config = {
    runtime: 'experimental-edge',
}


export default async function (req: NextRequest) {

    const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
    const API_TOKEN = process.env.API_ACCESS_TOKEN

    const authorization = getAccessToken(req)
    if (!authorization) return new Response(null, { status: 401 })
    if (req.method !== 'POST' || !isSameOrigin(req)) return new Response(null, { status: 400 })

    const { job_id, manager_id } = await readJson(req)

    if (!isUUID(job_id)) {
        return new Response(null, { status: 400 })
    }

    try {

        const currentUser = await fetch(`${DB_URL}/users/me?fields=id,email`, {
            headers: {
                'Authorization': `Bearer ${authorization}`
            }
        }).then(readJsonResponse).then(res => res?.data)

        const jobData = currentUser && await fetch(`${DB_URL}/items/jobs/${job_id}`, {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`
            }
        })
            .then(readJsonResponse)
            .then(body => body?.data)

        if (!currentUser || !jobData) return new Response(null, { status: 400 })

        let managers = JSON.parse(jobData.managers || '[]')

        const currentUserIsOwner = isSameEmail(currentUser.email, jobData.email)
        const currentUserIsManager = managers.filter((manager: User) => manager.id === currentUser.id).length !== 0

        if (!(currentUserIsOwner || currentUserIsManager)) return new Response(null, { status: 403 })

        if (!managers.some((manager: User) => manager.id === manager_id)) return new Response(null, { status: 400 })

        managers = managers.filter((manager: User) => manager.id !== manager_id)

        const jobUpdate = jobData && await fetch(`${DB_URL}/items/jobs/${job_id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify({
                managers
            })
        }).then(readJsonResponse).then(body => body?.data)

        if (jobUpdate) return new Response(null, { status: 204 })

        return new Response(null, { status: 400 })

    } catch (error) {
        console.log('API Manage Submit error: ', error)
        return new Response(null, { status: 400 })
    }
}
