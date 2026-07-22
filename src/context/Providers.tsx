"use client";

import { useRouter } from "next/navigation";
import { RouterProvider } from "@heroui/react";
import { NextAuthProvider } from "./auth/NextAuthProvider";
import { QueryProvider } from "./query/QueryProvider";
import { ThemeProvider } from "./theme/ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <NextAuthProvider>
      <QueryProvider>
        <RouterProvider navigate={(path) => router.push(String(path))}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </RouterProvider>
      </QueryProvider>
    </NextAuthProvider>
  );
}
