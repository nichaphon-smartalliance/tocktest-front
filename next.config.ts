import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  transpilePackages: ["@heroui/react"],
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{kebabCase member}}",
    },
  },
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
