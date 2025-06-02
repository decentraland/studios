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
const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

export default async function (req: NextRequest) {

    const apiAccessToken = req.nextUrl.searchParams.get('access_token')
    if (apiAccessToken) {
        if (apiAccessToken !== SENDGRID_INBOUND_TOKEN) {
            return new Response(null, { status: 401 })
        }
    }

    const user = req.cookies.get("auth")?.value
    if (user) {
        const userAuthorization = JSON.parse(user).access_token

        const currentUser = await fetch(`${DB_URL}/users/me?fields=status`, {
            headers: {
                'Authorization': `Bearer ${userAuthorization}`
            }
        }).then(res => res.ok && res.json()).then(res => res.data && res.data)

        if (!currentUser || currentUser.status !== 'active') return new Response(null, { status: 401 })
    }

    if (!(apiAccessToken || user)) {
        return new Response(null, { status: 401 })
    }


    if (req.method === 'POST') {
        const formData = await req.formData()

        await Messages.processIncommingMessage(formData)

        return new Response()
    }

}
