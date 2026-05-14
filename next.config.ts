import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Slim, self-contained server bundle for Docker production image.
  output: "standalone",
};

export default nextConfig;
