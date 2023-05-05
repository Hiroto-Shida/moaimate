/** @type {import('next').NextConfig} */
const NextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    experimental: { newNextLinkBehavior: false }, // chakraとNext/linkのエラー解決
}

module.exports = NextConfig