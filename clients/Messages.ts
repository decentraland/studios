import replyParser from 'node-email-reply-parser'

import Files from './Files'
import { isUUID } from '../components/utils'
import { discardResponse, isSameEmail, normalizeEmail, readJsonResponse } from '../lib/security'
import { getUsersBy } from '../lib/users'

export const config = {
    runtime: 'edge',
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

const MESSAGE_MAX_LENGTH = 100000

const FILES_FOLDER = "e6038421-dec4-4977-a23d-b31865053ecb"

const REPLY_DOMAIN = 'reply.studios.decentraland.org'

/**
 * Returns the conversation id of a `<conversation id>@reply.studios.decentraland.org` address, or undefined.
 */
export function getConversationId(address: unknown) {
    if (typeof address !== 'string') return undefined
    const separator = address.lastIndexOf('@')
    if (separator <= 0) return undefined
    const localPart = address.slice(0, separator)
    const domain = address.slice(separator + 1).toLowerCase()
    return domain === REPLY_DOMAIN && isUUID(localPart) ? localPart : undefined
}

export function getReplyAddress(conversationId: string) {
    return `${conversationId}@${REPLY_DOMAIN}`
}

// Drops empty values and addresses that only differ in case
const uniqueEmails = (emails: unknown[]) => {
    const seen = new Set<string>()
    const unique: string[] = []
    for (const email of emails) {
        const key = normalizeEmail(email)
        if (!key || seen.has(key)) continue
        seen.add(key)
        unique.push(email as string)
    }
    return unique
}

export default class Messages {

    static async processIncommingMessage(formData: FormData) {
        // Never throws, so an unexpected Directus answer can't fail the inbound email webhook
        try {
            return await Messages.processMessage(formData)
        } catch (error) {
            console.log('Messages: error processing message: ', error)
            return new Response(null, { status: 500 })
        }
    }

    private static async processMessage(formData: FormData) {

        const parsedData: any = {}

        for (const [k, v] of formData.entries()) {
            parsedData[k] = v
        }
        if (typeof parsedData.text !== 'string' || parsedData.text.length > MESSAGE_MAX_LENGTH) return new Response(null, { status: 400 })

        const lastMessage = replyParser(parsedData.text).getVisibleText()

        let conversationEmail: unknown
        try {
            conversationEmail = JSON.parse(parsedData.envelope).to[0]
        } catch {
            return new Response(null, { status: 400 })
        }
        const conversationId = getConversationId(conversationEmail)
        const fromEmail = typeof parsedData.from === 'string' && parsedData.from.match(/<(.*)>/)?.[1]

        if (!conversationId || !fromEmail) return new Response(null, { status: 400 })

        const conversation = await fetch(`${DB_URL}/items/conversations/${conversationId}?fields=*,user_created.email,user_created.id,related_job.email,related_job.managers`, {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`
            }
        })
            .then(readJsonResponse)
            .then(res => res?.data)

        if (!conversation) return new Response(null, { status: 400 })

        const participants: unknown[] = [
            conversation.user_created?.email,
            conversation.related_job?.email,
        ]


        const studioData = conversation.user_created?.id && await fetch(`${DB_URL}/items/profile?filter[user]=${conversation.user_created.id}&fields=name`, {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`
            }
        })
            .then(readJsonResponse)
            .then(res => res?.data?.[0])

        const managers = JSON.parse(conversation.related_job?.managers || "[]")

        // Deleted managers are skipped
        const managersData = await getUsersBy('id', managers.map((manager: any) => manager?.id), 'email', API_TOKEN)
        participants.push(...managersData.map(manager => manager.email))

        const knownParticipants = uniqueEmails(participants)
        const authorEmail = knownParticipants.find(address => isSameEmail(address, fromEmail))

        if (!authorEmail) return new Response(null, { status: 400 })

        const recipientsEmail = knownParticipants.filter(address => !isSameEmail(address, fromEmail))

        // Directus filters are case-sensitive, so the stored address is tried before the one the sender used
        let author: any
        for (const email of authorEmail === fromEmail ? [authorEmail] : [authorEmail, fromEmail]) {
            author = await fetch(`${DB_URL}/users?filter[email]=${encodeURIComponent(email)}&fields=*,role.name`, {
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`
                }
            })
                .then(readJsonResponse)
                .then(res => res?.data?.[0])
            if (author) break
        }

        if (!author) return new Response(null, { status: 400 })

        if (author.role?.name === 'Studio' && studioData){
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
            .then(discardResponse)
            .then(res => res.ok)

        saveMessage && await Promise.all(recipientsEmail.map(recipientEmail => fetch(`${SENDRGRID_URL}/mail/send`, {
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
                    email: getReplyAddress(conversation.id), name: 'Decentraland Studios Inbox'
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
        })
            .then(discardResponse)
            .catch(error => console.log('Messages: error sending notification: ', error))))

        return new Response(JSON.stringify(saveMessage), { status: saveMessage ? 200 : 400 })
    }

}



