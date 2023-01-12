const { EnvironmentPlugin } = require('webpack');


/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: ['decentraland-ui'],
  
  reactStrictMode: true,

  experimental: { optimizeCss: true },

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
    config.plugins.push(new EnvironmentPlugin(['API_SUBMIT', 'API_VERIFY', 'API_ACCESS_TOKEN']))
    
    return config
  }
}

module.exports = nextConfig
