"use client";

import { Button } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errorPage");

  useEffect(() => {
    if (process.env.NODE_ENV === "development") console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-bold">{t("title")}</h1>
      <p className="text-muted text-sm max-w-md">{t("desc")}</p>
      <div className="flex gap-2">
        <Button variant="secondary" onPress={() => (window.location.href = "/login")}>
          {t("goLogin")}
        </Button>
        <Button variant="primary" onPress={reset}>
          {t("retry")}
        </Button>
      </div>
    </div>
  );
}
