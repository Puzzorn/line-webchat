/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'profile.line-scdn.net',
      },
      {
        protocol: 'https',
        hostname: 'obs.line-scdn.net',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/line/webhook',
        destination: '/api/line/webhook',
      },
      {
        source: '/line/send',
        destination: '/api/line/send',
      },
    ];
  },
};

export default nextConfig;
