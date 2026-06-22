"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { setupInterceptors } from "@/lib/api/interceptor";

function InterceptorSetup({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    setupInterceptors();
  }, []);

  return children;
}

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <InterceptorSetup>{children}</InterceptorSetup>
    </SessionProvider>
  );
}
