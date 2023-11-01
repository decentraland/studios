import { NextRequest, NextResponse, userAgent } from 'next/server'

export const config = {
  matcher: '/api/:path*',
}

export function middleware(req: NextRequest) {
  const { ua } = userAgent(req)

  if (ua.includes('Acunetix')) return new Response(null, { status: 401 })

  return NextResponse.next()
}