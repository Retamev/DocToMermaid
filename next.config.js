/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'pdf2pic', 'gm'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'supports-color': 'commonjs supports-color',
        'debug': 'commonjs debug',
        'gm': 'commonjs gm',
        'pdf2pic': 'commonjs pdf2pic',
      });
    }
    return config;
  },
};

module.exports = nextConfig;