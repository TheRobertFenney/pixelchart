/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        // Enable importing modules from outside the app directory
        "*.{js,jsx}": ["default", "client"],
      }
    }
  }
};

export default nextConfig;
