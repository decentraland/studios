import { NextApiResponse } from 'next'
import type { NextRequest, NextResponse } from 'next/server'

export const config = {
  runtime: 'experimental-edge',
  api: {
    bodyParser: false,
  },
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const API_TOKEN = process.env.API_ACCESS_TOKEN

export default async function (req: NextRequest, res: NextApiResponse) {

  const folder = `${req.headers.get('folder')}`
  const fileName = `${req.headers.get('fileName')}`

  const blob = await req.blob()

  const formData = new FormData()

  if (!folder || !fileName){
    return new Response(null, { status: 400 })
  }


  formData.append('folder', folder)

  formData.append('file', blob, fileName)

  return fetch(`${DB_URL}/files`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${API_TOKEN}`,
            },
            body: formData,
        })
  }