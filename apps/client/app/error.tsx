"use client";

import { Button } from "@repo/ui/components/button";

/** A failed render, in Persian, with a way to retry instead of a blank page. */
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-5 px-6 text-center">
      <h1 className="text-xl font-extrabold">مشکلی پیش آمد</h1>
      <p className="max-w-sm text-sm leading-7 text-muted-foreground">
        نمایش این صفحه ممکن نشد. لطفاً دوباره تلاش کن.
      </p>
      <Button variant="gradient" onClick={reset}>
        تلاش دوباره
      </Button>
    </main>
  );
}
