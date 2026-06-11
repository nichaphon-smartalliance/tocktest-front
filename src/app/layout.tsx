import type { Metadata } from "next";
import { Providers } from "@/context/Providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "TockTest — AI-First QA Platform",
  description: "ระบบทดสอบซอฟต์แวร์ด้วย AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link href="/heroui.min.css" rel="stylesheet" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
