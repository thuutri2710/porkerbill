/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    tinyUrlApi: process.env.TINYURL_API,
  },
};

module.exports = nextConfig;
