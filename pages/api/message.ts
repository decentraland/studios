import type { NextRequest } from 'next/server'
import Messages from '../../clients/Messages'
import { getAccessToken, isSameOrigin, readJsonResponse, timingSafeEqual } from '../../lib/security'

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

const getFromDomain = (formData: FormData) => getDomain(String(formData.get('from') || '').match(/<(.*)>/)?.[1] || '')

/**
 * Relaxed DKIM alignment, as in DMARC: a passing signature counts when its domain is the From domain
 * or a parent of it. SendGrid reports results like `{@example.com : pass, @other.com : fail}`.
 */
const isDkimAligned = (dkim: string, fromDomain: string) => {
    for (const [, domain, result] of Array.from(dkim.toLowerCase().matchAll(/@([a-z0-9.-]+)\s*:\s*([a-z]+)/g))) {
        const labels = domain.split('.')
        if (result !== 'pass' || labels.length < 2 || labels.some(label => !label)) continue
        if (fromDomain === domain || fromDomain.endsWith(`.${domain}`)) return true
    }
    return false
}

/**
 * SendGrid's inbound parse reports SPF and DKIM results but forwards every email regardless.
 * The From header is only trusted when a DKIM signature aligned with its domain passed, or when SPF passed
 * for an envelope sender on that same domain.
 */
const isAuthenticatedEmail = (formData: FormData) => {
    const fromDomain = getFromDomain(formData)
    if (!fromDomain) return false

    const dkimPass = isDkimAligned(String(formData.get('dkim') || ''), fromDomain)

    let envelopeFrom = ''
    try {
        envelopeFrom = JSON.parse(String(formData.get('envelope') || '{}')).from || ''
    } catch {}
    const spfPass = String(formData.get('SPF') || '').toLowerCase() === 'pass' && getDomain(envelopeFrom) === fromDomain

    return dkimPass || spfPass
}

/**
 * Returns the password sent with HTTP Basic auth. SendGrid's Inbound Parse sends the credentials embedded in
 * its destination URL (https://user:password@host/path) this way.
 */
const getBasicAuthPassword = (req: NextRequest) => {
    const [scheme, encoded] = (req.headers.get('authorization') || '').split(' ')
    if (scheme?.toLowerCase() !== 'basic' || !encoded) return undefined
    try {
        // atob returns one char per byte, decode them as UTF-8 so non-ASCII passwords match
        const credentials = new TextDecoder().decode(Uint8Array.from(atob(encoded), c => c.charCodeAt(0)))
        const separator = credentials.indexOf(':')
        return separator === -1 ? undefined : credentials.slice(separator + 1)
    } catch {
        return undefined
    }
}

export default async function (req: NextRequest) {

    if (req.method !== 'POST') return new Response(null, { status: 400 })

    const inboundPassword = getBasicAuthPassword(req)
    // TODO: remove in the first release after the Inbound Parse URL is switched to basic auth (see README). The token in the query string ends up in logs.
    const apiAccessToken = req.nextUrl.searchParams.get('access_token')
    const inboundToken = inboundPassword ?? apiAccessToken

    if (inboundToken) {
        if (!SENDGRID_INBOUND_TOKEN || !timingSafeEqual(inboundToken, SENDGRID_INBOUND_TOKEN)) {
            return new Response(null, { status: 401 })
        }

        if (inboundPassword === undefined) {
            console.log('API Message: inbound email authenticated with the deprecated access_token query param, switch the Inbound Parse URL to basic auth')
        }

        const formData = await req.formData()

        // Always acknowledge the webhook, otherwise SendGrid keeps retrying emails that were rejected on purpose
        if (!isAuthenticatedEmail(formData)) {
            console.log(`API Message: dropped inbound email from ${getFromDomain(formData)} that failed SPF/DKIM checks`)
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
    }).then(readJsonResponse).then(res => res?.data)

    if (!currentUser || currentUser.status !== 'active') return new Response(null, { status: 401 })

    const formData = await req.formData()

    // Messages sent from the dashboard are always authored by the logged in user
    formData.set('from', `<${currentUser.email}>`)

    return Messages.processIncommingMessage(formData)
}
