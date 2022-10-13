/** @type {import('next').NextConfig} */

const withTranspiledModules = require('next-transpile-modules')(['decentraland-ui'])

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ['en-US'],
    defaultLocale: 'en-US',
  },
}

module.exports = withTranspiledModules(nextConfig)
