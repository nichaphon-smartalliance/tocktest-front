import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { Providers } from "@/context/Providers";
import { inter, notoSansThai } from "@/lib/fonts";
import "@/app/globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return {
    title: "TockTest - AI-First QA Platform",
    description: t("description"),
  };
}

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
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const saved = localStorage.getItem("tocktest-theme");
                const mode = saved === "dark" || saved === "light" ? saved : "light";
                document.documentElement.setAttribute("data-theme", mode);
              } catch {}
            })();`,
          }}
        />
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
