import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  transpilePackages: ["@heroui/react"],
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
  async headers() {
    const isDev = process.env.NODE_ENV !== "production";
    // Dev (Turbopack/React Refresh) needs eval + HMR websockets; production is stricter.
    const contentSecurityPolicy = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'", // HeroUI / Tailwind / TipTap inject inline styles
      "img-src 'self' data: blob: https:", // base64 avatars (data:), uploads (blob:), GitHub avatars (https:)
      "font-src 'self' data:",
      `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
