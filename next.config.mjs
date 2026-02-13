/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Note: ESLint is no longer configured here in this version.
  // We use /* eslint-disable */ in files or skip linting via environment variables if needed.
};

export default nextConfig;
