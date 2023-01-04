const { EnvironmentPlugin } = require('webpack');


/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: ['decentraland-ui'],
  
  reactStrictMode: true,
  
  webpack(config) {
    config.plugins.push(new EnvironmentPlugin(['API_SUBMIT', 'API_VERIFY', 'API_ACCESS_TOKEN']))
    
    return config
  }
}

module.exports = nextConfig
