import type { NextRequest } from 'next/server'

export const config = {
    runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const API_TOKEN = process.env.API_ACCESS_TOKEN

const SENDRGRID_URL = process.env.NEXT_PUBLIC_API_SENDGRID
const SENDGRID_ACCESS_TOKEN = process.env.SENDGRID_ACCESS_TOKEN

export default async function (req: NextRequest) {
    const user = req.cookies.get("currentUser")?.value || ''
    const authorization = JSON.parse(user).access_token

    const body = await req.json()


    const currentJob = await fetch(`${DB_URL}/items/jobs?filter[id]=${body.job.id}`, {
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`
        }
    }).then(res => res.ok && res.json()).then(res => res.data.length && res.data[0])


    const currentUser = await fetch(`${DB_URL}/users/me`, {
        headers: {
            'Authorization': `Bearer ${authorization}`
        }
    }).then(res => res.ok && res.json()).then(res => res.data && res.data)


    const currentStudio = currentUser && await fetch(`${DB_URL}/items/profile?filter[user]=${currentUser.id}`, {
        headers: {
            'Authorization': `Bearer ${authorization}`
        }
    }).then(res => res.ok && res.json()).then(res => res.data.length && res.data[0])


    let recipientsList = [... new Set([currentJob.email, currentUser.email, currentStudio.email])]

    let personalizations: any = {
        to: [
            { email: recipientsList.pop() }
        ],
        dynamic_template_data: {
            job_author: currentJob.author_name,
            job_url: `https://studios.decentraland.org/jobs?id=${currentJob.id}`,
            partner_name: currentStudio.name,
            partner_logo: `${DB_URL}/assets/${currentStudio.logo}?key=logo`,
            partner_url: `https://studios.decentraland.org/profile/${currentStudio.slug}`,
            message: body.message
        }
    }

    if (recipientsList.length) {
        personalizations.cc = recipientsList.map(email => ({ email: email }))
    }

    const sendMail = currentStudio && await fetch(`${SENDRGRID_URL}/mail/send`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SENDGRID_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
            from: {
                email: "studios@decentraland.org", name: "Decentraland Studios"
            },
            reply_to: {
                email: currentUser.email, name: currentStudio.name
            },
            personalizations: [personalizations],
            template_id: "d-510e48fb8bed468c8c3411510d30d04e"
        })
    })

    
    const createMessage = sendMail && await fetch(`${DB_URL}/items/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authorization}`
        },
        body: JSON.stringify({
            message: body.message,
            to_job: body.job.id,
            from_profile: currentStudio.id
        })
    }).then(res => res.ok)


    if (createMessage) return new Response(null, { status: 204 })

    return new Response(null, { status: 400 })
}
