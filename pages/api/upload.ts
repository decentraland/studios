import type { NextRequest } from 'next/server'
import Files from '../../clients/Files'

export const config = {
  runtime: 'experimental-edge',
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const API_TOKEN = process.env.API_ACCESS_TOKEN

export default async function (req: NextRequest) {

  const folder = req.headers.get('folder')
  const fileName = req.headers.get('fileName')

  const blob = await req.blob()
  const arrayBuffer = await blob.arrayBuffer()
  const newBlob = new Blob([arrayBuffer], { type: blob.type })

  if (!folder || !fileName){
    return new Response(null, { status: 400 })
  }
  
  return Files.upload(newBlob, fileName, folder)
  
  //TODO: check auth for uploading from dashboard

  // const formData = new FormData()

  // formData.append('folder', folder)

  // formData.append('file', blob, fileName)

  // return fetch(`${DB_URL}/files`, {
  //           method: 'POST',
  //           headers: { 
  //               'Authorization': `Bearer ${API_TOKEN}`,
  //           },
  //           body: formData,
  //       })
  }