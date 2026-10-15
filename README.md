This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

The CMS backend is running on an instance of Directus. The .env file entry `NEXT_PUBLIC_PARTNERS_DATA_URL` points to it's public endpoint.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment variables

You will need to create a local .env.local next to .env file containing the following variables:

```bash
NEXT_PUBLIC_METABASE_KEY=
NEXT_PUBLIC_INTERCOM_APP_ID=

API_ACCESS_TOKEN=

SENDGRID_ACCESS_TOKEN=
SENDGRID_INBOUND_TOKEN=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Random secret (e.g. `openssl rand -base64 32`) used to sign email verification links
VERIFICATION_TOKEN_SECRET=

# Cloudflare Turnstile widget keys (Cloudflare dashboard > Turnstile, widget mode "Managed")
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
# Optional comma-separated hostnames a Turnstile token must have been issued on (e.g. `studios.decentraland.org`).
# Leave it unset in local development and previews to skip the hostname check.
TURNSTILE_ALLOWED_HOSTNAMES=
```

The tracked `.env` file is public: only add `NEXT_PUBLIC_*` values there and keep every secret in `.env.local`.

The build fails if any of the server secrets above or `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is missing, except the optional `TURNSTILE_ALLOWED_HOSTNAMES`.

### Turnstile

The login, signup, contact, review, landing and guest job forms are protected by [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/). The forms send the widget token as `turnstileToken` and the API routes reject the request with a 400 when it doesn't validate. Each form renders the widget with its own action (`login`, `user-exists`, `signup`, `resend`, `contact`, `review`, `landing`, `job`) and its route rejects tokens issued for another action or, when `TURNSTILE_ALLOWED_HOSTNAMES` is set, for another hostname. Tokens are single-use, so forms reset the widget and drop the token as soon as they send it.

For local development use Cloudflare's [test keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/), which always pass:

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

## Rate limiting

Turnstile stops scripted submissions but not a human or a solver farm hammering an endpoint. Add a Cloudflare WAF rate limiting rule (Security > WAF > Rate limiting rules) for the unauthenticated endpoints:

```
(http.request.method eq "POST" and http.request.uri.path in {"/api/user/login" "/api/user/signup" "/api/user/resend" "/api/user/exists" "/api/jobs/create-guest" "/api/contact" "/api/reviews/submit" "/api/landing/submit"})
```

Example thresholds, counted per IP:

| Path | Requests | Period | Action |
| --- | --- | --- | --- |
| `/api/user/login` | 10 | 1 minute | Block for 10 minutes |
| `/api/user/exists`, `/api/user/signup`, `/api/jobs/create-guest` | 10 | 10 minutes | Block for 1 hour |
| `/api/contact`, `/api/reviews/submit`, `/api/landing/submit` | 5 | 10 minutes | Block for 1 hour |

Each row is a separate rule matching its own paths. On plans that allow a single rate limiting rule, use the expression above with the strictest values.

## Content Security Policy

`headers.js` sends two policies:

- `Content-Security-Policy`: a baseline that is enforced (`object-src`, `base-uri` and `frame-ancestors`).
- `Content-Security-Policy-Report-Only`: the strict policy built by `lib/csp.js`. Browsers don't block anything it disallows, they only report it.

Inline scripts are allowed by their `sha256` hash. Every inline `<Script>` must render a snippet from `lib/inlineScripts.js`, and `lib/csp.js` must hash it with the same arguments. The hashes are computed when the build starts, using the `NEXT_PUBLIC_*` values that the snippets include. The isbot script from jsDelivr is loaded with a Subresource Integrity hash, so update `ISBOT_INTEGRITY` whenever its version changes. To print the policy for the current environment, run:

```bash
node -e "console.log(require('./lib/csp').buildContentSecurityPolicy())"
```

To check for violations, open the site with the browser dev tools open and browse every kind of page: home, search, profiles, projects, a `/p/` landing, the dashboard, sign up and the Intercom chat. Each blocked resource is logged in the console as `[Report Only] Refused to load ...` or `[Report Only] Refused to execute inline script ...`, naming the directive that would block it. Add the legitimate origins to `lib/csp.js`.

Browsers also send every violation of the report-only policy to `/api/csp-report` (through the `report-uri` directive, and `report-to` with the `Reporting-Endpoints` header for browsers that support the Reporting API). Each violation is logged as a single `CSP violation:` line with the directive, the blocked URL, the page (without its query string), the source file and line, so the violations from real visitors show up in the Cloudflare Pages function logs (real-time logs). Review them before switching to enforcing.

To enforce the policy once no legitimate violations are reported, change the `Content-Security-Policy-Report-Only` key in `headers.js` to `Content-Security-Policy` and remove the baseline entry, since the strict policy already includes its directives.

## SendGrid Inbound Parse

`/api/message` receives the email replies that SendGrid's Inbound Parse forwards, authenticated with `SENDGRID_INBOUND_TOKEN`. The token was previously sent in the `?access_token=` query string, which ends up in logs. To migrate:

1. In SendGrid, change the Inbound Parse destination URL to `https://sendgrid:<SENDGRID_INBOUND_TOKEN>@studios.decentraland.org/api/message`. SendGrid sends those credentials as HTTP Basic auth, and any user name is accepted.
2. Check that incoming emails no longer log `authenticated with the deprecated access_token query param`.
3. Remove the `access_token` query param support from `pages/api/message.ts` in the first release after the Inbound Parse URL has been switched to basic auth.

## Deploy on Cloudflare Pages

This project runs on Cloudflare Pages through [@cloudflare/next-on-pages](https://github.com/cloudflare/next-on-pages) v1. Every API route uses the Edge Runtime (`export const config = { runtime: 'edge' }`) and every page is statically generated; next-on-pages rejects any route that would need the Node.js runtime.

Cloudflare build settings:
```
Framework preset: None
Build command: npm_config_legacy_peer_deps=true npx @cloudflare/next-on-pages@1.13.16
Build output directory: .vercel/output/static
```

next-on-pages is deprecated and archived, and its last release declares `next <=15.5.2` and `vercel <=47.0.4` as peers. The project uses a newer, patched Next.js 15.5 release, so the build command skips the peer check (`npm_config_legacy_peer_deps=true`; without it `npx` also fails to resolve the latest `wrangler` peer). `vercel` is pinned to `47.0.4` in `devDependencies` because next-on-pages runs `vercel build` from the project's own dependencies.

Environment variables in addition to the listed before:

`NODE_VERSION=22`

Node.js 20 is end of life; use Node.js 22 (LTS).

Do not set `NODE_ENV=production` as a build variable: `npm` would then skip the `devDependencies`, and `typescript`, `eslint` and `vercel` are needed by the build.

Set the Functions compatibility date and flags for both the Production and the Preview environments. They are configured per environment, and a deployment without the `nodejs_compat` flag fails at runtime.

Functions Compatibility date (Production and Preview):

`2024-09-23`

Functions Compatibility flags (Production and Preview):

`nodejs_compat`

To check the build locally (with the same environment variables in place):

```bash
npm_config_legacy_peer_deps=true npx @cloudflare/next-on-pages@1.13.16
npx wrangler pages dev .vercel/output/static --compatibility-flag=nodejs_compat --compatibility-date=2024-09-23
```
