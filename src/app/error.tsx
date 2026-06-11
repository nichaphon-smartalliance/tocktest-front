"use client";

import { useEffect } from "react";
import { Button } from "@heroui/react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-bold">เกิดข้อผิดพลาด</h1>
      <p className="text-muted text-sm max-w-md">
        ลองรีเฟรชหน้า หรือล้าง cache แล้วรัน dev server ใหม่
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" onPress={() => (window.location.href = "/login")}>
          ไปหน้า Login
        </Button>
        <Button variant="primary" onPress={reset}>
          ลองอีกครั้ง
        </Button>
      </div>
    </div>
  );
}
