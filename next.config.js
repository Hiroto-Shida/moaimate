/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    experimental: { newNextLinkBehavior: false }, // chakraとNext/linkのエラー解決
}

module.exports = nextConfig