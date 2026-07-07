/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: ".next-v2",
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb"
    }
  }
};

export default nextConfig;
