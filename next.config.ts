import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  transpilePackages: ["@heroui/react"],
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{kebabCase member}}",
    },
  },
  allowedDevOrigins: [
    "localhost",
    "https://did.smartalliance.co.th",
    "did.smartalliance.co.th",
    "localhost:3001",
    "192.168.33.162",
    "192.168.33.162:3001",
    "192.168.33.166",
    "192.168.33.160",
    "192.168.33.166:3000",
    "192.168.33.160:6601",
    "154.197.124.206",
  ],
  async redirects() {
    return [
      // Repo root has no page; send it to the first tab.
      { source: "/repos/:repoId", destination: "/repos/:repoId/test-cases", permanent: false },
      // Sandbox tab was removed; keep stale links/bookmarks working.
      { source: "/repos/:repoId/sandbox", destination: "/repos/:repoId/test-cases", permanent: false },
    ];
  },
};

export default withNextIntl(nextConfig);
