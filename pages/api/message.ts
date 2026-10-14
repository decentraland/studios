import type { NextRequest } from 'next/server'
import Messages from '../../clients/Messages'
import { getAccessToken, isSameOrigin, timingSafeEqual } from '../../lib/security'

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

const getDomain = (address: string) => address.split('@').pop()?.toLowerCase()

/**
 * SendGrid's inbound parse reports SPF and DKIM results but forwards every email regardless.
 * The From header is only trusted when a DKIM signature for its domain passed, or when SPF passed
 * for an envelope sender on that same domain.
 */
const isAuthenticatedEmail = (formData: FormData) => {
    const from = String(formData.get('from') || '').match(/<(.*)>/)?.[1] || ''
    const fromDomain = getDomain(from)
    if (!fromDomain) return false

    const dkim = String(formData.get('dkim') || '').toLowerCase()
    const dkimPass = dkim.includes(`@${fromDomain} : pass`)

    let envelopeFrom = ''
    try {
        envelopeFrom = JSON.parse(String(formData.get('envelope') || '{}')).from || ''
    } catch {}
    const spfPass = String(formData.get('SPF') || '').toLowerCase() === 'pass' && getDomain(envelopeFrom) === fromDomain

    return dkimPass || spfPass
}

export default async function (req: NextRequest) {

    if (req.method !== 'POST') return new Response(null, { status: 400 })

    const apiAccessToken = req.nextUrl.searchParams.get('access_token')

    if (apiAccessToken) {
        if (!SENDGRID_INBOUND_TOKEN || !timingSafeEqual(apiAccessToken, SENDGRID_INBOUND_TOKEN)) {
            return new Response(null, { status: 401 })
        }

        const formData = await req.formData()

        // Always acknowledge the webhook, otherwise SendGrid keeps retrying emails that were rejected on purpose
        if (!isAuthenticatedEmail(formData)) {
            console.log('API Message: dropped inbound email that failed SPF/DKIM checks')
            return new Response()
        }

        await Messages.processIncommingMessage(formData)
        return new Response()
    }

    const userAuthorization = getAccessToken(req)
    if (!userAuthorization) return new Response(null, { status: 401 })
    if (!isSameOrigin(req)) return new Response(null, { status: 400 })

    const currentUser = await fetch(`${DB_URL}/users/me?fields=status,email`, {
        headers: {
            'Authorization': `Bearer ${userAuthorization}`
        }
    }).then(res => res.ok && res.json()).then(res => res.data && res.data)

    if (!currentUser || currentUser.status !== 'active') return new Response(null, { status: 401 })

    const formData = await req.formData()

    // Messages sent from the dashboard are always authored by the logged in user
    formData.set('from', `<${currentUser.email}>`)

    return Messages.processIncommingMessage(formData)
}
