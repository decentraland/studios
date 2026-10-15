import type { NextRequest } from 'next/server'

export const config = {
  runtime: 'edge',
}

const MAX_BODY_SIZE = 16 * 1024
const MAX_FIELD_LENGTH = 512
// Caps the log lines a single request can produce
const MAX_REPORTS_PER_REQUEST = 5

/**
 * Reads the body as text, giving up when it's larger than `maxSize` bytes so oversized reports are never buffered.
 */
async function readText(req: NextRequest, maxSize: number) {
  if (Number(req.headers.get('content-length')) > maxSize || !req.body) return undefined

  const reader = req.body.getReader()
  const decoder = new TextDecoder()
  let size = 0
  let text = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maxSize) {
      reader.cancel().catch(() => {})
      return undefined
    }
    text += decoder.decode(value, { stream: true })
  }
  return text + decoder.decode()
}

const field = (value: unknown) => {
  if (typeof value === 'number') return value
  if (typeof value !== 'string' || !value) return undefined
  return value.slice(0, MAX_FIELD_LENGTH)
}

const withoutQuery = (value: unknown) => {
  if (typeof value !== 'string') return undefined
  try {
    const url = new URL(value)
    return field(url.origin + url.pathname)
  } catch {
    return field(value.split(/[?#]/)[0])
  }
}

/**
 * Normalizes the legacy `report-uri` format and the Reporting API format into the same compact shape.
 */
const toViolation = (report: any) => ({
  directive: field(report['effective-directive'] ?? report.effectiveDirective),
  blocked: withoutQuery(report['blocked-uri'] ?? report.blockedURL),
  document: withoutQuery(report['document-uri'] ?? report.documentURL),
  source: withoutQuery(report['source-file'] ?? report.sourceFile),
  line: field(report['line-number'] ?? report.lineNumber),
  disposition: field(report.disposition),
})

const getReports = (payload: any): any[] => {
  if (Array.isArray(payload)) {
    // application/reports+json
    return payload
      .filter((report) => report?.type === 'csp-violation' && report.body && typeof report.body === 'object')
      .map((report) => report.body)
  }
  // application/csp-report
  const report = payload?.['csp-report']
  return report && typeof report === 'object' ? [report] : []
}

export default async function handler(req: NextRequest) {

  if (req.method === 'POST') {
    try {
      const text = await readText(req, MAX_BODY_SIZE)
      if (text) {
        const violations = getReports(JSON.parse(text))
          .map(toViolation)
          .filter((violation) => violation.directive || violation.blocked)
          .slice(0, MAX_REPORTS_PER_REQUEST)
        for (const violation of violations) {
          console.log('CSP violation:', JSON.stringify(violation))
        }
      }
    } catch {}
  }

  return new Response(null, { status: 204 })
}
