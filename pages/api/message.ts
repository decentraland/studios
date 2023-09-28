import type { NextRequest } from 'next/server'

export const config = {
    runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const API_TOKEN = process.env.API_ACCESS_TOKEN

export default async function (req: NextRequest) {
    
    const formData = await req.formData()

    // let paramsData = {
    //     "headers": "",
    //     "dkim": "",
    //     "content-ids": "",
    //     "to": "",
    //     "text": "",
    //     "html": "",
    //     "from": "",
    //     "sender_ip": "",
    //     "spam_report": "",
    //     "envelope": "",
    //     "attachments": "",
    //     "subject": "",
    //     "spam_score": "",
    //     "attachment-info": "",
    //     "charsets": "",
    //     "SPF": "",
    // }
    
    // Object.keys(paramsData).forEach((param: string) =>
    //     paramsData = {
    //         ...paramsData, [param]: formData.get(param)
    //     })
    
    const paramsList = [
        "headers",
        "dkim",
        "content-ids",
        "to",
        "text",
        "html",
        "from",
        "sender_ip",
        "spam_report",
        "envelope",
        "attachments",
        "subject",
        "spam_score",
        "attachment-info",
        "charsets",
        "SPF",
    ]
    
    const parsedData: any = {}
    paramsList.forEach((param) => parsedData[param] = formData.get(param))

    fetch(`${DB_URL}/items/test_messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify({ message: parsedData }),
    })
        .then(res => res.json())
        // .then(body => console.log(body))
        .catch(e => console.log(e))

    return new Response()
}