import type { NextRequest } from 'next/server'

export const config = {
  runtime: 'experimental-edge',
}

export default async function (req: NextRequest) {

  const API_SUBMIT = process.env.API_SUBMIT
  const API_TOKEN = process.env.API_ACCESS_TOKEN
  
  const body = await req.json()

  try{
    const submitResponse = await fetch(`${API_SUBMIT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        review: body.review
      })
    })


    const submitBody = await submitResponse.json()

    if (submitBody.uuid && submitBody.email){
      return new Response(JSON.stringify(submitBody))
    }

    return new Response(null, { status: 400 })

  } catch (error) {
    console.log('API Review Submit error: ', error )
    return new Response(null, { status: 400 })
  }
}
