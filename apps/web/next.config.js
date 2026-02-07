const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    swcMinify: true,
    workboxOptions: {
        disableDevLogs: true,
        exclude: [/middleware-manifest\.json$/, /build-manifest\.json$/, /react-loadable-manifest\.json$/, /\/uploads\//, /\.map$/],
        runtimeCaching: [
            {
                urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                    cacheName: 'google-fonts-webfonts',
                    expiration: {
                        maxEntries: 4,
                        maxAgeSeconds: 365 * 24 * 60 * 60, // 365 days
                    },
                },
            },
            {
                urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'google-fonts-stylesheets',
                    expiration: {
                        maxEntries: 4,
                        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                    },
                },
            },
            {
                urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'static-font-assets',
                    expiration: {
                        maxEntries: 4,
                        maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
                    },
                },
            },
            {
                urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'static-image-assets',
                    expiration: {
                        maxEntries: 64,
                        maxAgeSeconds: 24 * 60 * 60 // 24 hours
                    },
                },
            },
            {
                urlPattern: /\/_next\/image\?url=.+$/i,
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'next-image',
                    expiration: {
                        maxEntries: 64,
                        maxAgeSeconds: 24 * 60 * 60, // 24 hours
                    },
                },
            },
            {
                urlPattern: /\/api\/.*$/i,
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'apis',
                    expiration: {
                        maxEntries: 16,
                        maxAgeSeconds: 24 * 60 * 60, // 24 hours
                    },
                    networkTimeoutSeconds: 10, // fallback to cache if API takes >10s
                },
            },
            {
                urlPattern: /\/uploads\/.*$/i,
                handler: 'NetworkFirst', // Uploads should try network first, then cache
                options: {
                    cacheName: 'uploads',
                    expiration: {
                        maxEntries: 32,
                        maxAgeSeconds: 24 * 60 * 60, // 24 hours
                    },
                },
            },
        ],
    },
});

const nextConfig = {
    transpilePackages: ['swagger-ui-react'],
    serverExternalPackages: ['@prisma/client', 'bcryptjs', 'swagger-jsdoc'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ui-avatars.com',
                pathname: '/api/**',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            }
        ],
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; img-src 'self' blob: data: https://res.cloudinary.com https://ui-avatars.com https://*.tile.openstreetmap.org https://unpkg.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.pusher.com wss://*.pusher.com https://va.vercel-scripts.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self';"
                    }
                ]
            }
        ];
    }
};

module.exports = withPWA(withNextIntl(nextConfig));
