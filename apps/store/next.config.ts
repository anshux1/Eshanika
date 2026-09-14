import "./src/env";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@eshanika/api",
    "@eshanika/auth",
    "@eshanika/db",
    "@eshanika/env",
    "@eshanika/messaging",
    "@eshanika/payments",
    "@eshanika/types",
    "@eshanika/ui",
    "@eshanika/validation",
    "@eshanika/workflows",
  ],
};

export default nextConfig;
