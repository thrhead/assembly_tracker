import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Trigger restart
  reactCompiler: true,
  transpilePackages: ['next-auth', 'openid-client'],
};

export default nextConfig;
