const { buildContentSecurityPolicy } = require('./lib/csp');

const headers = [
    {
      key: 'X-DNS-Prefetch-Control',
      value: 'on',
    },
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload',
    },
    {
      key: 'Server',
      value: 'Apache', // phony server value
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },
    {
      key: 'X-Frame-Options',
      value: 'sameorigin',
    },
    {
      key: 'X-XSS-Protection',
      value: '0', // the legacy XSS auditor is deprecated and can introduce leaks; CSP replaces it
    },
    {
      key: 'Referrer-Policy',
      value: 'same-origin',
    },
    {
      key: 'Permissions-Policy',
      value: 'geolocation=(), camera=(), microphone=(), payment=()',
    },
    {
      // Scripts aren't restricted yet because of the third party trackers loaded in _app.tsx,
      // but plugins, <base> hijacking and framing by other sites are blocked.
      key: 'Content-Security-Policy',
      value: "object-src 'none'; base-uri 'self'; frame-ancestors 'self'",
    },
    {
      // Strict policy, only reported until it's verified that no legitimate resource is blocked (see README)
      key: 'Content-Security-Policy-Report-Only',
      value: buildContentSecurityPolicy({ dev: process.env.NODE_ENV !== 'production' }),
    },
    {
      // Endpoint used by the report-to directive of the report-only policy
      key: 'Reporting-Endpoints',
      value: 'csp-endpoint="/api/csp-report"',
    },
  ];
  
  module.exports = headers