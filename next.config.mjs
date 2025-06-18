/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Avoid bundling Node-only modules on the client
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        encoding: false,
      };
    }

    return config;
  },
};

export default nextConfig;
