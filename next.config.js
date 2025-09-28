/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize 'canvas' for Node.js builds so pdfjs-dist works
      config.externals = config.externals || [];
      config.externals.push("canvas");
      // Optionally keep your existing aliases
      config.resolve.alias.canvas = false;
      config.resolve.alias.encoding = false;
    }
    return config;
  },
};

export default nextConfig;
