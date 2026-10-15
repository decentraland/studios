import type { NextRequest } from 'next/server'

export interface RequestGeo {
  country?: string
  region?: string
  city?: string
  latitude?: string
  longitude?: string
}

// Next.js 15 removed `NextRequest.ip` and `NextRequest.geo`. On Cloudflare the same data
// is exposed through request headers set by the edge.
export function getRequestIp(req: NextRequest): string | undefined {
  return req.headers.get('cf-connecting-ip') ?? req.headers.get('x-real-ip') ?? undefined
}

// next-on-pages copies `request.cf` into the `x-vercel-ip-*` headers on every request (writing
// missing fields as the string "undefined"). The `cf-*` headers are only present when the zone's
// "Add visitor location headers" managed transform is enabled.
// `region` is always a region code (e.g. "CA"), from `x-vercel-ip-country-region` or `cf-region-code`.
export function getRequestGeo(req: NextRequest): RequestGeo {
  const header = (name: string) => {
    const value = req.headers.get(name)
    return value && value !== 'undefined' ? value : undefined
  }
  const decode = (value?: string) => {
    if (!value) return undefined
    try {
      return decodeURIComponent(value)
    } catch {
      return undefined
    }
  }
  return {
    country: header('x-vercel-ip-country') ?? header('cf-ipcountry'),
    region: header('x-vercel-ip-country-region') ?? header('cf-region-code'),
    city: decode(header('x-vercel-ip-city')) ?? header('cf-ipcity'),
    latitude: header('x-vercel-ip-latitude') ?? header('cf-iplatitude'),
    longitude: header('x-vercel-ip-longitude') ?? header('cf-iplongitude'),
  }
}
