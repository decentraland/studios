/** @type {import('next').NextConfig} */

const withTranspiledModules = require('next-transpile-modules')(['decentraland-ui'])

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = withTranspiledModules(nextConfig)
