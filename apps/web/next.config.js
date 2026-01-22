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
    },
});

const nextConfig = {
    serverExternalPackages: ['@prisma/client', 'bcryptjs'],
    experimental: {
        turbopack: {},
    },
};

module.exports = withPWA(withNextIntl(nextConfig));
