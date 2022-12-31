/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['decentraland-ui'],
  
  reactStrictMode: true,
  
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'admin.dclstudios.org',
        port: '',
        pathname: '/assets/**',
      },
    ],
  }
}

module.exports = nextConfig
