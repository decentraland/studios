import type { NextRequest } from 'next/server'
import { getAccessToken, isSameOrigin, normalizeEmail, readJson, readJsonResponse } from '../../../lib/security'
import { budgetToRanges, isUUID } from '../../../components/utils'

export const config = {
    runtime: 'experimental-edge',
}


export default async function (req: NextRequest) {

    const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
    const API_TOKEN = process.env.API_ACCESS_TOKEN

    const authorization = getAccessToken(req)
    if (!authorization) return new Response(null, { status: 401 })
    if (req.method !== 'POST' || !isSameOrigin(req)) return new Response(null, { status: 400 })

    const { job_id } = await readJson(req)

    if (!isUUID(job_id)) {
        return new Response(null, { status: 400 })
    }

    try {

        const currentUser = await fetch(`${DB_URL}/users/me?fields=id,email,first_name,last_name`, {
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

        let managers_invites: string[] = JSON.parse(jobData.managers_invites || '[]')
        let managers = JSON.parse(jobData.managers || '[]')

        const currentUserEmail = normalizeEmail(currentUser.email)

        if (!currentUserEmail || !managers_invites.some(email => normalizeEmail(email) === currentUserEmail)) {
            return new Response(null, { status: 403 })
        }

        managers_invites = managers_invites.filter(email => normalizeEmail(email) !== currentUserEmail)
        managers.push({ id: currentUser.id })

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
        }).then(readJsonResponse).then(body => body?.data)
        if (jobUpdate) return new Response(null, { status: 204 })

        return new Response(null, { status: 400 })

    } catch (error) {
        console.log('API Manage Submit error: ', error)
        return new Response(null, { status: 400 })
    }
}
