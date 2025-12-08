import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://ufgnkirvgeaijzudwbkg.supabase.co/**')],
  },
};

export default nextConfig;