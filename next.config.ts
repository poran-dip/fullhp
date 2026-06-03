import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://ufgnkirvgeaijzudwbkg.supabase.co/**"),
      new URL("https://randomuser.me/**"),
      new URL("https://api.dicebear.com/**"),
    ],
  },
};

export default nextConfig;
