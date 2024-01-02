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
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

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