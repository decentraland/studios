import type { NextRequest } from 'next/server'

export const config = {
  runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

export default async function (req: NextRequest) {
    const user = req.cookies.get("currentUser")?.value || ''

    const authorization = JSON.parse(user).access_token

    if (req.method === 'POST'){
        const body = await req.json()
        const { id } = body;

        return fetch(`${DB_URL}/items/jobs??filter[verified_email]=true&filter[id]=${id}&fields=*,brief_file.id,brief_file.filename_download,messages.*`, {
            headers: { 
                'Authorization': `Bearer ${authorization}`
            }
        })
    }
    
    if (req.method === 'GET'){

        return fetch(`${DB_URL}/items/jobs??filter[verified_email]=true&fields=*,brief_file.id,brief_file.filename_download,messages.*`, {
            headers: { 
                'Authorization': `Bearer ${authorization}`
            }
        })
    }

  }