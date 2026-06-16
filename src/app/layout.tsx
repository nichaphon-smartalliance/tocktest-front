import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Providers } from "@/context/Providers";
import { inter, notoSansThai } from "@/lib/fonts";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "TockTest — AI-First QA Platform",
  description: "ระบบทดสอบซอฟต์แวร์ด้วย AI",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={`${inter.variable} ${notoSansThai.variable}`}>
      <head>
        <link href="/heroui.min.css" rel="stylesheet" />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
