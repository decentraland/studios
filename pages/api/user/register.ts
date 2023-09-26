import { create } from 'domain'
import type { NextRequest } from 'next/server'

export const config = {
  runtime: 'experimental-edge',
}

const API_TOKEN = process.env.API_ACCESS_TOKEN
const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const SENDRGRID_URL = process.env.NEXT_PUBLIC_API_SENDGRID
const SENDGRID_ACCESS_TOKEN = process.env.SENDGRID_ACCESS_TOKEN

function getUserId (email: string) {
// console.log(`${DB_URL}/users?filter[email]=${email}`)
  return fetch(`${DB_URL}/users?filter[email]=${encodeURIComponent(email)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.ok && res.json())
    .then(res => res.data && res.data[0])
}

export default async function (req: NextRequest) {
  const reqBody = await req.json()

  let createUser = await fetch(`${DB_URL}/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...reqBody,
      geo: req.geo
    })
  })
    .then(res => res.json())
    .then(body => {
      if (body.data) return body.data
      if (body.errors && body.errors[0].extensions.code === "RECORD_NOT_UNIQUE") return getUserId(reqBody.email)
    })

  const sendMailVerifications = createUser.id && await fetch(`${SENDRGRID_URL}/mail/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SENDGRID_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      from: {
        email: "studios@decentraland.org", name: "Decentraland Studios"
      },
      personalizations: [{
        to: [
          { email: reqBody.email, name: reqBody.first_name }
        ],
        dynamic_template_data: {
          ...reqBody,
          verify_url: `https://studios.decentraland.org/user/verify?id=${createUser.id}`,
        }
      }],
      template_id: "d-6e4af1c34f6d432bb18b09bf778cae3e"
    })
  })

  if (sendMailVerifications.ok) return new Response()

  return new Response(null, { status: 400 })

}