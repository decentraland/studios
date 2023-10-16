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

export default async function (req: NextRequest) {
    
    if (req.method === 'POST') {
        const formData = await req.formData()

        await Messages.processIncommingMessage(formData)

        return new Response()
    }

}
