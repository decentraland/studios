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
  
  webpack(config, { isServer }) {
    config.plugins.push(new EnvironmentPlugin(['API_SUBMIT', 'API_VERIFY', 'API_ACCESS_TOKEN', 'SENDGRID_ACCESS_TOKEN', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID']))

    if (isServer){
      require('./clients/sitemap')
    }
    
    return config
  }
  
}

module.exports = nextConfig
