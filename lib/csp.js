const { createHash } = require('crypto')
const inlineScripts = require('./inlineScripts')

const hash = (script) => `'sha256-${createHash('sha256').update(script).digest('base64')}'`

const getOrigin = (url) => {
  try {
    return new URL(url).origin
  } catch {
    return undefined
  }
}

/**
 * Builds the Content-Security-Policy for the site. Inline scripts are allowed by hash, so every snippet rendered
 * with <Script> must come from lib/inlineScripts.js and be listed here with the same arguments used to render it.
 */
function buildContentSecurityPolicy({ dev = false } = {}) {
  const directus = getOrigin(process.env.NEXT_PUBLIC_PARTNERS_DATA_URL)
  const metabaseKey = process.env.NEXT_PUBLIC_METABASE_KEY
  const intercomAppId = process.env.NEXT_PUBLIC_INTERCOM_APP_ID

  const inlineScriptHashes = [
    inlineScripts.googleTagInit(),
    inlineScripts.segmentInit(metabaseKey),
    inlineScripts.plausibleInit(),
    inlineScripts.intercomInit(intercomAppId, true),
    inlineScripts.intercomInit(intercomAppId, false),
    inlineScripts.fbPixelInit(),
    inlineScripts.linkedinPartnerId(),
    inlineScripts.linkedinTracking(),
  ].map(hash)

  const google = {
    script: ['https://*.googletagmanager.com', 'https://www.googleadservices.com', 'https://googleads.g.doubleclick.net', 'https://www.google.com'],
    img: ['https://*.google-analytics.com', 'https://*.googletagmanager.com', 'https://googleads.g.doubleclick.net', 'https://www.google.com'],
    connect: ['https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://*.googletagmanager.com', 'https://*.g.doubleclick.net', 'https://www.google.com', 'https://www.googleadservices.com', 'https://pagead2.googlesyndication.com'],
    frame: ['https://td.doubleclick.net', 'https://www.googletagmanager.com'],
  }

  const intercom = {
    script: ['https://widget.intercom.io', 'https://js.intercomcdn.com'],
    img: ['https://js.intercomcdn.com', 'https://static.intercomassets.com', 'https://downloads.intercomcdn.com', 'https://uploads.intercomusercontent.com', 'https://gifs.intercomcdn.com', 'https://video-messages.intercomcdn.com', 'https://messenger-apps.intercom.io', 'https://*.intercom-attachments-1.com', 'https://*.intercom-attachments-2.com', 'https://*.intercom-attachments-5.com', 'https://*.intercom-attachments-7.com', 'https://*.intercom-attachments-9.com'],
    connect: ['https://*.intercom.io', 'wss://*.intercom.io', 'https://uploads.intercomcdn.com', 'https://uploads.intercomusercontent.com'],
    font: ['https://js.intercomcdn.com', 'https://fonts.intercomcdn.com'],
    frame: ['https://intercom-sheets.com', 'https://www.intercom-reporting.com'],
    media: ['https://js.intercomcdn.com', 'https://downloads.intercomcdn.com'],
    form: ['https://intercom.help', 'https://api-iam.intercom.io'],
  }

  const directives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      ...inlineScriptHashes,
      ...(dev ? ["'unsafe-eval'"] : []),
      inlineScripts.ISBOT_SRC,
      ...google.script,
      'https://cdn.segment.com',
      'https://plausible.io',
      ...intercom.script,
      'https://connect.facebook.net',
      'https://snap.licdn.com',
      'https://challenges.cloudflare.com',
    ],
    // Inline styles are needed by React style attributes, decentraland-ui and Intercom
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      directus,
      ...google.img,
      'https://www.facebook.com',
      'https://px.ads.linkedin.com',
      ...intercom.img,
    ],
    'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com', ...intercom.font],
    'connect-src': [
      "'self'",
      directus,
      ...google.connect,
      'https://cdn.segment.com',
      'https://api.segment.io',
      'https://plausible.io',
      ...intercom.connect,
      'https://www.facebook.com',
      'https://connect.facebook.net',
      'https://px.ads.linkedin.com',
    ],
    'frame-src': ['https://www.youtube.com', 'https://challenges.cloudflare.com', ...google.frame, ...intercom.frame],
    'media-src': ["'self'", directus, ...intercom.media],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'", ...intercom.form],
    'frame-ancestors': ["'self'"],
    // report-uri is the legacy mechanism, browsers that support the Reporting API use report-to instead
    'report-uri': ['/api/csp-report'],
    'report-to': ['csp-endpoint'],
  }

  return Object.entries(directives)
    .map(([directive, sources]) => [directive, ...sources.filter(Boolean)].join(' '))
    .join('; ')
}

module.exports = { buildContentSecurityPolicy }
