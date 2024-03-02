import replyParser from 'node-email-reply-parser'

import Files from './Files'

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

const API_TOKEN = process.env.API_ACCESS_TOKEN
const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

const SENDRGRID_URL = process.env.NEXT_PUBLIC_API_SENDGRID
const SENDGRID_ACCESS_TOKEN = process.env.SENDGRID_ACCESS_TOKEN

const FILES_FOLDER = "e6038421-dec4-4977-a23d-b31865053ecb"

export default class Messages {

    static async processIncommingMessage(formData: FormData) {

        const parsedData: any = {}

        for (const [k, v] of formData.entries()) {
            parsedData[k] = v
        }
        const lastMessage = replyParser(parsedData.text).getVisibleText()

        const conversationEmail = JSON.parse(parsedData.envelope).to[0]
        const conversationId = conversationEmail.split('@')[0]
        const fromEmail = parsedData.from.match(/<(.*)>/)[1]

        const conversation = await fetch(`${DB_URL}/items/conversations/${conversationId}?fields=*,user_created.email,user_created.id,related_job.email,related_job.managers`, {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`
            }
        })
            .then(res => res.ok && res.json())
            .then(res => res.data)

        if (!conversation) return new Response(null, { status: 400 })

        const participants = [...new Set([
            conversation.user_created.email,
            conversation.related_job.email,
        ])]


        const studioData = await fetch(`${DB_URL}/items/profile?filter[user]=${conversation.user_created.id}&fields=name`, {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`
            } 
        })
            .then(res => res.ok && res.json())
            .then(res => res.data[0])

        const managers = JSON.parse(conversation.related_job.managers || "[]")

        for (const manager of managers) {
            const userMail = await fetch(`${DB_URL}/users/${manager.id}?fields=email`, {
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`
                }
            })
                .then(res => res.ok && res.json())
                .then(res => res.data.email)
                participants.push(userMail)
        }

        if (!participants.includes(fromEmail)) return new Response(null, { status: 400 })
        
        const recipientsEmail = participants.filter(address => address !== fromEmail)

        const author = await fetch(`${DB_URL}/users?filter[email]=${encodeURIComponent(fromEmail)}&fields=*,role.name`, {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`
            }
        })
            .then(res => res.ok && res.json())
            .then(res => res.data.length && res.data[0])

        if (author.role.name === 'Studio'){
            author.first_name = studioData.name
            author.last_name = ""
        }

        const newMessage: any = {
            parsed_email: parsedData,
            author: author.id,
            conversation: conversation.id,
            message: lastMessage
        }

        //Temporary disabled files uploads
        // if (parsedData['attachment-info']) {

        //     parsedData['attachment-info'] = JSON.parse(parsedData['attachment-info'])

        //     for (const key in parsedData['attachment-info']) {

        //         const file = formData.get(key) as File
        //         const arrayBuffer = await file.arrayBuffer()
        //         const blob = new Blob([arrayBuffer], { type: file.type })

        //         const uploadedFileId = await Files.upload(blob, file.name, FILES_FOLDER)
        //             .then(res => res.ok && res.json())
        //             .then(body => body.data.id)

        //         parsedData['attachment-info'][key].file_id = uploadedFileId
        //         newMessage.attachments = [...newMessage.attachments || [], { "directus_files_id": uploadedFileId }]
        //     }
        // }

        const saveMessage = await fetch(`${DB_URL}/items/messages_dashboard`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify(newMessage),
        })
            .then(res => res.ok)

        const sendEmails = saveMessage && await Promise.all( recipientsEmail.map(async recipientEmail => await fetch(`${SENDRGRID_URL}/mail/send`, {
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
                    email: conversationEmail, name: 'Decentraland Studios Inbox'
                },
                personalizations: [{
                    to: [
                        { email: recipientEmail }
                    ],
                    dynamic_template_data: {
                        conversation_title: conversation.title,
                        author_name: author.first_name,
                        author_lastName: author.last_name,
                        message_text: lastMessage,
                        attachments: parsedData['attachment-info']
                    }
                }],
                template_id: "d-c7ff3cf874c449ecbed9783bf3f1be51"
            })
        }).then(res => res)))
        
        return new Response(JSON.stringify(saveMessage))
    }
    
}



