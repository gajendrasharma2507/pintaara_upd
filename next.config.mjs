const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    const backendHost = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://127.0.0.1:8000';
    return [
      {
        source: '/storage/:path*',
        destination: `${backendHost}/storage/:path*`,
      },
      {
        source: '/images/uploads/:path*',
        destination: `${backendHost}/images/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
