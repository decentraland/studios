import type { NextRequest } from 'next/server'
import { isUUID } from '../../../components/utils'

export const config = {
  runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const API_TOKEN = process.env.API_ACCESS_TOKEN

export default async function (req: NextRequest) {

  const { id } = await req.json()

  if (!isUUID(id)) {
    return new Response(null, { status: 400 })
  }

  const currentJob = await fetch(`${DB_URL}/items/jobs/${id}?fields=id,verified_email,title,author_name,short_description,long_description,deadline_date,brief_file.id,brief_file.filename_download`, {
    method: 'GET',
    headers: {
    'Authorization': `Bearer ${API_TOKEN}`
    }
  }).then(res => res.ok && res.json()).then(res => res.data && res.data)

  if (currentJob.verified_email){
    return new Response(JSON.stringify(currentJob))
  }

  return new Response(null, { status: 400 })
}