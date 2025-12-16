/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        domains: ['images.unsplash.com'],
    },
    webpack: (config, { isServer }) => {
        // Exclude problematic connectors and dependencies
        config.resolve.alias = {
            ...config.resolve.alias,
            'porto/internal': false,
            'porto': false,
            '@react-native-async-storage/async-storage': false,
            'pino-pretty': false,
        };

        // Add fallbacks for Node.js modules
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            net: false,
            tls: false,
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
            buffer: require.resolve('buffer'),
        };

        // Ignore specific modules that cause issues
        config.externals = [
            ...(config.externals || []),
            'porto/internal',
            '@react-native-async-storage/async-storage',
            'pino-pretty'
        ];

        return config;
    },
    experimental: {
        esmExternals: 'loose'
    }
};

module.exports = nextConfig;
