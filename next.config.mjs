// next.config.mjs

import nextTranspileModules from 'next-transpile-modules';
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
  PHASE_PRODUCTION_SERVER,
} from 'next/constants.js';

const withTM = nextTranspileModules(['mammoth']);

/** @type {import('next').NextConfig} */
const nextConfig = (phase) =>
  withTM({
    reactStrictMode: false,
    distDir:
      phase === PHASE_DEVELOPMENT_SERVER
        ? '.next-dev'
        : phase === PHASE_PRODUCTION_BUILD || phase === PHASE_PRODUCTION_SERVER
          ? '.next-prod'
          : '.next',
    images: {
      domains: [
        "grcbucket.s3.amazonaws.com",
        "grcbucket.s3.us-east-1.amazonaws.com",
        "www.google.com",
        "localhost",
      ],
    },
    async rewrites() {
      return [
        // Auth
        {
          source: "/apiv1/:path*",
          destination: "https://dev.grc3.io/apiv1/:path*",
        },
        // Legacy/other API prefixes used in app
        {
          source: `/priv/:path*`,
          destination: `https://dev.grc3.io/priv/:path*`,
        },
        {
          source: "/apiv2/:path*",
          destination: "https://dev.grc3.io/apiv2/:path*",
        },
        {
          source: "/apiv2test/:path*",
          destination: "https://dev.grc3.io/apiv2test/:path*",
        },
        {
          source: "/apiv2jay/:path*",
          destination: "https://dev.grc3.io/apiv2jay/:path*",
        },
      ];
    },
  });

export default nextConfig;

