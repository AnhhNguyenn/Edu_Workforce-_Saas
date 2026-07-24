/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    transpilePackages: ['@tanstack/react-query', '@tanstack/query-core'],
};

export default nextConfig;
