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

The login, signup, contact, review and landing forms are protected by [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/). The forms send the widget token as `turnstileToken` and the API routes reject the request with a 400 when it doesn't validate. Each form renders the widget with its own action (`login`, `user-exists`, `signup`, `resend`, `contact`, `review`, `landing`) and its route rejects tokens issued for another action or, when `TURNSTILE_ALLOWED_HOSTNAMES` is set, for another hostname. Tokens are single-use, so forms reset the widget and drop the token as soon as they send it.

For local development use Cloudflare's [test keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/), which always pass:

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

## Rate limiting

Turnstile stops scripted submissions but not a human or a solver farm hammering an endpoint. Add a Cloudflare WAF rate limiting rule (Security > WAF > Rate limiting rules) for the unauthenticated endpoints:

```
(http.request.method eq "POST" and http.request.uri.path in {"/api/user/login" "/api/user/signup" "/api/user/resend" "/api/user/exists" "/api/contact" "/api/reviews/submit" "/api/landing/submit"})
```

Example thresholds, counted per IP:

| Path | Requests | Period | Action |
| --- | --- | --- | --- |
| `/api/user/login` | 10 | 1 minute | Block for 10 minutes |
| `/api/user/exists`, `/api/user/signup` | 10 | 10 minutes | Block for 1 hour |
| `/api/contact`, `/api/reviews/submit`, `/api/landing/submit` | 5 | 10 minutes | Block for 1 hour |

Each row is a separate rule matching its own paths. On plans that allow a single rate limiting rule, use the expression above with the strictest values.

## Deploy on Cloudflare Pages

This project is optimized for running on a Cloudflare Pages instance by using [@cloudflare/next-on-pages](https://github.com/cloudflare/next-on-pages) library.

Cloudflare build settings:
```
Framework preset: none
Build command: npx @cloudflare/next-on-pages@pre-v1 --experimental-minify
Build output directory: .vercel/output/static
```
Environment variables in addition to the listed before:

`NODE_VERSION= 16`

Functions Compatibility date:

`2022-11-30`

Functions Compatibility flags:
`nodejs_compat`