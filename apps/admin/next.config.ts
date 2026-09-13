import "./src/env";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@eshanika/env", "@eshanika/ui"],
};

export default nextConfig;
