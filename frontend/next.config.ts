import type { NextConfig } from 'next';

// URL do backend em produção (Railway)
const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
const backendHostname = (() => {
  try {
    return backendUrl ? new URL(backendUrl).hostname : '';
  } catch {
    return '';
  }
})();

const nextConfig: NextConfig = {
  experimental: {
    // Otimizações de performance
  },
  images: {
    remotePatterns: [
      // Desenvolvimento local
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/certificates/**',
      },
      // Produção - Railway backend
      ...(backendHostname
        ? [
            {
              protocol: 'https' as const,
              hostname: backendHostname,
              pathname: '/uploads/**',
            },
            {
              protocol: 'https' as const,
              hostname: backendHostname,
              pathname: '/certificates/**',
            },
          ]
        : []),
      // Wildcard para subdomínios Railway
      {
        protocol: 'https',
        hostname: '**.railway.app',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**.railway.app',
        pathname: '/certificates/**',
      },
    ],
  },
  // Segurança
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
      ],
    },
  ],
};

export default nextConfig;
