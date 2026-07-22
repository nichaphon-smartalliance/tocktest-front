"use client";

import { useEffect } from "react";

// TEMPORARY dev-only diagnostic. Captures the stack trace when react-aria emits
// "A PressResponder was rendered without a pressable child" so we can identify
// the exact component. Remove once the source is found.
export function PressResponderDebug() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const originalError = console.error;
    const originalWarn = console.warn;
    const wrap =
      (orig: (...a: unknown[]) => void) =>
      (...args: unknown[]) => {
        const msg = args.map((a) => String(a)).join(" ");
        if (msg.includes("PressResponder")) {
          // eslint-disable-next-line no-console
          console.log("[PRESS-RESPONDER-DEBUG] stack:\n" + new Error().stack);
        }
        orig(...args);
      };
    console.error = wrap(originalError) as typeof console.error;
    console.warn = wrap(originalWarn) as typeof console.warn;
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return null;
}
