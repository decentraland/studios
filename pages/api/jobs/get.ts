import type { NextRequest } from 'next/server'

export const config = {
  runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

export default async function (req: NextRequest) {
    const user = req.cookies.get("currentUser")?.value || ''

    const authorization = JSON.parse(user).access_token

    const body = await req.json()
    const { id } = body;

    const jobData = (await fetch(`${DB_URL}/items/jobs?filter[id]=${id}`, {
            headers: { 
                'Authorization': `Bearer ${authorization}`
            }
        }).then((res) => res.json())).data[0]

        let message = []

        if (jobData) {
            message = (await fetch(`${DB_URL}/items/messages?filter[to_job][id]=${jobData.id}&filter[user_created]=$CURRENT_USER&fields=*,from_profile.name,from_profile.logo`, {
                headers: { 
                    'Authorization': `Bearer ${authorization}`
                }
            }).then((res) => res.json() )).data[0]
        }

    return new Response(JSON.stringify({job: jobData, message}))
  }