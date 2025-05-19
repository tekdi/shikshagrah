// next.config.ts

// eslint-disable-next-line @typescript-eslint/no-var-requires
const isDev = process.env.NODE_ENV === 'development';
const { composePlugins, withNx } = require('@nx/next');
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false,
});

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  basePath: '/shikshalokam',
  nx: {
    svgr: false,
  },
};

const plugins = [withNx, withPWA];

module.exports = composePlugins(...plugins)(nextConfig);
