/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required for Render static export deployment
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http',  hostname: '**' },
    ],
  },
  // Allow cross-origin requests in dev from local network devices
  allowedDevOrigins: ['172.20.10.4', 'localhost', '127.0.0.1'],
};

export default nextConfig;
