const { EnvironmentPlugin } = require('webpack');


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
    config.plugins.push(new EnvironmentPlugin(['API_SUBMIT', 'API_VERIFY', 'API_ACCESS_TOKEN', 'SENDGRID_ACCESS_TOKEN', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID']))
    
    return config
  },

  async rewrites() {
    return  [
      {
        source: '/metaverse-guide',
        destination: '/metaverse-guide/index.html'
      }
    ]
  }
}

module.exports = nextConfig
