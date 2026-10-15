const { EnvironmentPlugin } = require('webpack');
const headers = require('./headers');

/** @type {import('next').NextConfig} */

const nextConfig = {
  
  transpilePackages: ['decentraland-ui'],
  
  reactStrictMode: true,
  
  poweredByHeader: false,

  // Every <Image> is rendered unoptimized; disabling the optimizer keeps /_next/image (and its
  // known vulnerabilities in this Next.js version) unreachable.
  images: {
    unoptimized: true,
  },
  
  webpack(config, { isServer }) {
    // Next inlines NEXT_PUBLIC_* values on its own, but without the site key every Turnstile-protected form is unusable
    if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      throw new Error('NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set. Add it to .env.local (see the Turnstile section of the README).')
    }

    // Secrets are only inlined into server and edge bundles, never into code shipped to browsers
    if (isServer) {
      config.plugins.push(new EnvironmentPlugin(['API_ACCESS_TOKEN', 'SENDGRID_ACCESS_TOKEN', 'SENDGRID_INBOUND_TOKEN', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'VERIFICATION_TOKEN_SECRET', 'TURNSTILE_SECRET_KEY']))
      // Optional: the null default keeps the build from failing when it's unset
      config.plugins.push(new EnvironmentPlugin({ TURNSTILE_ALLOWED_HOSTNAMES: null }))
    }
    
    require('./clients/sitemap')
    
    return config
  },
  
  experimental: {
    scrollRestoration: true,
  },
    
  async headers() {
    return [
      {
        source: '/(.*)',
        headers,
      },
    ];
  },

}

module.exports = nextConfig