import type { NextRequest } from 'next/server'
import Messages from '../../clients/Messages'

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

const SENDGRID_INBOUND_TOKEN = process.env.SENDGRID_INBOUND_TOKEN


export default async function (req: NextRequest) {

    const accessToken = req.nextUrl.searchParams.get('access_token')
    
    if (accessToken !== SENDGRID_INBOUND_TOKEN) {
        return new Response(null, {status: 401})
    }

    if (req.method === 'POST') {
        const formData = await req.formData()

        await Messages.processIncommingMessage(formData)

        return new Response()
    }

}
