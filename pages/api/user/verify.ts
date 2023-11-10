import type { NextRequest } from 'next/server'

export const config = {
  runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const API_TOKEN = process.env.API_ACCESS_TOKEN

export default async function (req: NextRequest) {

  const { id } = await req.json()

//   const currentJob = await fetch(`${DB_URL}/items/jobs/${id}?fields=*,brief_file.id,brief_file.filename_download`, {
//     method: 'GET',
//     headers: {
//     'Authorization': `Bearer ${API_TOKEN}`
//     }
//   }).then(res => res.ok && res.json()).then(res => res.data && res.data)

//   if (currentJob.verified_email){
//     return new Response(JSON.stringify(currentJob))
//   }

  return fetch(`${DB_URL}/users/${id}`, {
      method: 'PATCH',
      headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        status: "active"
      })
  })

//   return new Response(JSON.stringify(verify))
}