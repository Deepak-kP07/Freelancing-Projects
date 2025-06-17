
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: [
        'https://6000-firebase-studio-1749045836617.cluster-bg6uurscprhn6qxr6xwtrhvkf6.cloudworkstations.dev',
        'https://9000-firebase-studio-1749045836617.cluster-bg6uurscprhn6qxr6xwtrhvkf6.cloudworkstations.dev'
    ],
  },
};

export default nextConfig;
