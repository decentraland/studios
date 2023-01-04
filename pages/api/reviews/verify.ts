import type { NextRequest } from 'next/server'

export const config = {
  runtime: 'experimental-edge',
}

export default async function (req: NextRequest) {

  const API_VERIFY_URL = process.env.API_VERIFY
  const API_TOKEN = process.env.API_ACCESS_TOKEN

  const body = await req.json()

  try {
    const verifyRes = await fetch(`${API_VERIFY_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        uuid: body.uuid
      })
    })

    if (verifyRes.ok){
      const reviewData = await verifyRes.json()
      return new Response(JSON.stringify(reviewData))
    }

  } catch (error){
    console.log('API Review Verify error: ', error )
    return new Response(null, { status: 400 })

  }
}