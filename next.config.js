/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Keep production builds lighter in constrained environments.
  experimental: {
    webpackBuildWorker: false
  },
  // Next 16 uses Turbopack by default; declare it explicitly alongside
  // the webpack hook so development and production builds can start.
  turbopack: {},
  webpack: (config) => {
    // Source maps add substantial memory overhead during production builds.
    config.devtool = false
    return config
  },
}
module.exports = nextConfig