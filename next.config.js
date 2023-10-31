const { EnvironmentPlugin } = require('webpack');
const headers = require('./headers');

/** @type {import('next').NextConfig} */

const nextConfig = {
  
  transpilePackages: ['decentraland-ui'],
  
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'admin.dclstudios.org',
        port: '',
        pathname: '/assets/**',
      },
    ],
  },
  
  webpack(config) {
    config.plugins.push(new EnvironmentPlugin(['API_ACCESS_TOKEN', 'SENDGRID_ACCESS_TOKEN', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID']))

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
