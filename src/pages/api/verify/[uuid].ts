import { NextApiRequest, NextApiResponse } from 'next'

const VERIFY_API_URL = process.env.VERIFY_API
const WEBSITE_URL = process.env.WEBSITE_URL

type ResponseError = {
  message: string
}

type VerifyRequest = {
  uuid: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req
  const { uuid } = query

  const verifyRes = await fetch(`${VERIFY_API_URL}?rev=${uuid}`)
  const status = await verifyRes.json()

  return status.name === 'error'
    ? res.redirect(`${WEBSITE_URL}/verify/error`)
    : res.redirect(`${WEBSITE_URL}/verify/success`)
}
