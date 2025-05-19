//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
// @ts-ignore
const BASE_PATH = process.env.NEXT_PUBLIC_SHIKSHAGRAHA_BASEPATH || '';

const isDev = process.env.NODE_ENV === 'development';
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false,
});

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  basePath: '',
};

const plugins = [withNx, withPWA];

module.exports = composePlugins(...plugins)(nextConfig);
