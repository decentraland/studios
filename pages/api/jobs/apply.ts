import type { NextRequest } from 'next/server'

export const config = {
    runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

const SENDRGRID_URL = process.env.NEXT_PUBLIC_API_SENDGRID
const SENDGRID_ACCESS_TOKEN = process.env.SENDGRID_ACCESS_TOKEN

export default async function (req: NextRequest) {
    const user = req.cookies.get("currentUser")?.value || ''
    const authorization = JSON.parse(user).access_token

    const body = await req.json()


    try {
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

        const createMessage = currentStudio && await fetch(`${DB_URL}/items/messages?fields=*,from_profile.name,from_profile.logo,from_profile.email`, {
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
        }).then(res => res.ok && res.json()).then(res => res.data && res.data)
        
        let personalizations: any = {
            to: [
                { email: body.job.email }
            ],
            dynamic_template_data: {
                job_author: body.job.author_name,
                job_url: `https://studios.decentraland.org/jobs?id=${body.job.id}`,
                partner_name: currentStudio.name,
                partner_logo: `${DB_URL}/assets/${currentStudio.logo}?key=logo`,
                partner_url: `https://studios.decentraland.org/profile/${currentStudio.slug}`,
                message: body.message
            }
        }

        const ccList = [... new Set([body.job.email, currentUser.email, createMessage.from_profile.email])].slice(1)

        if (ccList.length){
            personalizations.cc = ccList.map(email => ({email: email}))
        }
    
        const sendMail = createMessage && await fetch(`${SENDRGRID_URL}/mail/send`, {
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
                personalizations: [ personalizations ],
                template_id: "d-510e48fb8bed468c8c3411510d30d04e"
            })
        })
        // console.log(sendMail)
        if (sendMail.ok) return new Response(JSON.stringify({ message: createMessage }))


    } catch (err) {
        console.log('Error: ', err)
    }

    return new Response(null, { status: 400 })
}
