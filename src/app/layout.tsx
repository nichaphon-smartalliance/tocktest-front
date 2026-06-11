import type { Metadata } from "next";
import { Providers } from "@/context/Providers";
import { inter, notoSansThai } from "@/lib/fonts";
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
    <html lang="th" suppressHydrationWarning className={`${inter.variable} ${notoSansThai.variable}`}>
      <head>
        <link href="/heroui.min.css" rel="stylesheet" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
