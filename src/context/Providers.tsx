"use client";

import { NextAuthProvider } from "./auth/NextAuthProvider";
import { QueryProvider } from "./query/QueryProvider";
import { ThemeProvider } from "./theme/ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthProvider>
      <QueryProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryProvider>
    </NextAuthProvider>
  );
}
