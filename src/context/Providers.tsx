"use client";

import { useRouter } from "next/navigation";
import { RouterProvider } from "@heroui/react";
import { NextAuthProvider } from "./auth/NextAuthProvider";
import { QueryProvider } from "./query/QueryProvider";
import { ThemeProvider } from "./theme/ThemeProvider";
import { PressResponderDebug } from "./PressResponderDebug";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <NextAuthProvider>
      <QueryProvider>
        <RouterProvider navigate={(path) => router.push(String(path))}>
          <ThemeProvider>
            <PressResponderDebug />
            {children}
          </ThemeProvider>
        </RouterProvider>
      </QueryProvider>
    </NextAuthProvider>
  );
}
