import type { NextRequest } from 'next/server'
import { isUUID } from '../../../components/utils'

export const config = {
    runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const API_TOKEN = process.env.API_ACCESS_TOKEN

export default async function (req: NextRequest) {
    const user = req.cookies.get("auth")?.value || ''

    const authorization = JSON.parse(user).access_token
    const jobId = req.nextUrl.searchParams.get('id')
    // const client = req.nextUrl.searchParams.get('client')

    if (!authorization || req.method !== 'GET') return new Response(null, { status: 400 })


    if (jobId) {

        if (!isUUID(jobId)) {
            return new Response(null, { status: 400 })
        }
        
        // if (client) {

        //     const jobData = await fetch(`${DB_URL}/items/jobs?filter[email]=true&filter[id]=${jobId}&fields=*,brief_file.id,brief_file.filename_download,messages.*`, {
        //         headers: {
        //             'Authorization': `Bearer ${API_TOKEN}`
        //         }
        //     }).then(res => res.ok && res.json()).then(body => body.data[0])
        // }

        const jobData = await fetch(`${DB_URL}/items/jobs?filter[verified_email]=true&filter[id]=${jobId}&fields=*,brief_file.id,brief_file.filename_download,messages.*`, {
            headers: {
                'Authorization': `Bearer ${authorization}`
            }
        }).then(res => res.ok && res.json()).then(body => body.data[0])

        const conversation = jobData && await fetch(`${DB_URL}/items/conversations?filter[related_job]=${jobData.id}&filter[status]=active&fields=id,title,related_job,user_created,messages.id,messages.date_created,messages.message,messages.attachments.directus_files_id.id,messages.attachments.directus_files_id.filename_download,messages.author.id`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${authorization}`
            }
        })
            .then(res => res.ok && res.json())
            .then(body => body.data[0])

        const studioData = jobData && await fetch(`${DB_URL}/items/profile?filter[user]=$CURRENT_USER&fields=id,logo,name`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${authorization}`
            }
        })
            .then(res => res.ok && res.json())
            .then(body => body.data[0])

        if (conversation) {
            jobData.messages = conversation.messages
            jobData.messages[0].from_profile = studioData
        }


        return new Response(JSON.stringify(jobData))
    }

    return fetch(`${DB_URL}/items/jobs?fields=*,brief_file.id,brief_file.filename_download`, {
        headers: {
            'Authorization': `Bearer ${authorization}`
        }
    })

}