import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["3dsvg"],
  output: process.env.BUILD_TARGET === "electron" ? "export" : undefined,
  trailingSlash: true,
  experimental: {
    esmExternals: "loose",
  },
  webpack: (config) => {
    // Allow webpack to resolve ESM-only packages (like 3dsvg) that only export "import" condition
    if (Array.isArray(config.resolve.conditionNames)) {
      if (!config.resolve.conditionNames.includes("import")) {
        config.resolve.conditionNames.unshift("import");
      }
    } else {
      config.resolve.conditionNames = ["import", "require", "default", "browser"];
    }
    return config;
  },
};

export default nextConfig;
