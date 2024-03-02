import type { NextRequest } from 'next/server'
import Files from '../../clients/Files'

export const config = {
  runtime: 'experimental-edge',
}

export default async function (req: NextRequest) {

  return new Response(null, {status: 403})

  // const folder = req.headers.get('folder')
  // const fileName = req.headers.get('fileName')

  // const blob = await req.blob()
  // const arrayBuffer = await blob.arrayBuffer()
  // const newBlob = new Blob([arrayBuffer], { type: blob.type })

  // if (!folder || !fileName){
  //   return new Response(null, { status: 400 })
  // }
  
  // return Files.upload(newBlob, fileName, folder)
  }