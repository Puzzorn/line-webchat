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
      }
    ],
  },
};

export default nextConfig;
