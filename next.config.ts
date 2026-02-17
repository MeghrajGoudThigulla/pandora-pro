/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    webpack: (config: any, { isServer }: { isServer: boolean }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                encoding: false,
            };
        }
        return config;
    },
};

export default nextConfig;
