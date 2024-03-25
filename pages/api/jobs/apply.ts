import type { NextRequest } from 'next/server'
import Messages from '../../../clients/Messages'
import { isUUID } from '../../../components/utils'

export const config = {
    runtime: 'experimental-edge',
    unstable_allowDynamic: [
        '/node_modules/lodash/_root.js',
        '/node_modules/lodash/_cloneBuffer.js',
        '/node_modules/lodash/_baseClone.js',
        '/node_modules/lodash/cloneDeep.js',
        '/node_modules/node-email-reply-parser/lib/Email.js',
        '/node_modules/node-email-reply-parser/lib/Parser.js',
        '/node_modules/node-email-reply-parser/index.js'
    ],
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const API_TOKEN = process.env.API_ACCESS_TOKEN

const SENDRGRID_URL = process.env.NEXT_PUBLIC_API_SENDGRID
const SENDGRID_ACCESS_TOKEN = process.env.SENDGRID_ACCESS_TOKEN

export default async function (req: NextRequest) {

    const jobId = req.nextUrl.searchParams.get('id')
    const user = req.cookies.get("auth")?.value || ''

    if (req.method !== 'POST' || !user || !jobId) return new Response(null, { status: 400 })

    if (!isUUID(jobId)) {
        return new Response(null, { status: 400 })
    }

    const formData = await req.formData()

    const authorization = JSON.parse(user).access_token

    const currentJob = await fetch(`${DB_URL}/items/jobs?filter[id]=${jobId}`, {
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`
        }
    }).then(res => res.ok && res.json()).then(res => res.data.length && res.data[0])


    const currentUser = await fetch(`${DB_URL}/users/me?fields=id,email,role.name`, {
        headers: {
            'Authorization': `Bearer ${authorization}`
        }
    }).then(res => res.ok && res.json()).then(res => res.data && res.data)

    if (currentUser.role.name !== 'Studio') return new Response(null, { status: 400 })

    const createConversation = await fetch(`${DB_URL}/items/conversations?fields=id`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authorization}`
        },
        body: JSON.stringify({
            title: currentJob.title,
            related_job: currentJob.id
        })
    }).then(res => res.ok && res.json()).then(body => body.data)

    formData.append('envelope', JSON.stringify({ to: [`${createConversation.id}@reply.studios.decentraland.org`] }))
    formData.append('from', `<${currentUser.email}>`)

    const postMessage = await Messages.processIncommingMessage(formData)

    const currentStudio = currentUser && await fetch(`${DB_URL}/items/profile?filter[user]=${currentUser.id}`, {
        headers: {
            'Authorization': `Bearer ${authorization}`
        }
    }).then(res => res.ok && res.json()).then(res => res.data.length && res.data[0])

    // const mailToAuthor = currentStudio && await fetch(`${SENDRGRID_URL}/mail/send`, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${SENDGRID_ACCESS_TOKEN}`
    //     },
    //     body: JSON.stringify({
    //         from: {
    //             email: "studios@decentraland.org", name: "Decentraland Studios"
    //         },
    //         reply_to: {
    //             email: currentUser.email, name: currentStudio.name
    //         },
    //         personalizations: [{
    //             to: [
    //                 { email: currentJob.email }
    //             ],
    //             dynamic_template_data: {
    //                 job_author: currentJob.author_name,
    //                 job_url: `https://studios.decentraland.org/jobs/share?id=${currentJob.id}`,
    //                 job_title: currentJob.title,
    //                 partner_name: currentStudio.name,
    //                 partner_logo: `${DB_URL}/assets/${currentStudio.logo}?key=logo`,
    //                 partner_url: `https://studios.decentraland.org/profile/${currentStudio.slug}`,
    //                 partner_email: currentUser.email,
    //                 message: body.message?.message,
    //                 brief_file: body.message?.brief_file
    //             }
    //         }],
    //         template_id: "d-510e48fb8bed468c8c3411510d30d04e"
    //     })
    // })

    //send mail to studio, keep
    const mailToStudio = postMessage && await fetch(`${SENDRGRID_URL}/mail/send`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SENDGRID_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
            from: {
                email: "studios@decentraland.org", name: "Decentraland Studios"
            },
            personalizations: [{
                to: [... new Set([currentUser.email, currentStudio.email])].map(email => ({ email: email })),
                dynamic_template_data: {
                    job_author: currentJob.author_name,
                    job_company: currentJob.company,
                    job_title: currentJob.title,
                    job_url: `https://studios.decentraland.org/jobs?id=${currentJob.id}`,
                    partner_name: currentStudio.name,
                    message: formData.get('text'),
                    brief_file: formData.get('attachment1')
                }
            }],
            template_id: "d-0f855e4fdc154093bd51fea886cdb2d2"
        })
    })


    // const createMessage = mailToAuthor && await fetch(`${DB_URL}/items/messages?fields=*,brief_file.id,brief_file.filename_download`, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${authorization}`
    //     },
    //     body: JSON.stringify({
    //         message: body.message?.message,
    //         to_job: body.job.id,
    //         from_profile: currentStudio.id,
    //         brief_file: body.message?.brief_file?.id
    //     })
    // }).then(res => res.ok)


    if (mailToStudio) return new Response(null, { status: 204 })

    return new Response(null, { status: 400 })
}


