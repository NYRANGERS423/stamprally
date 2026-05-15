"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Renders nothing; navigates to `href` after `delayMs`.
// Used after a successful check-in to seamlessly return the user to
// /passport without doing a server-side redirect inside a render path
// that already wrote to the database.
export function AutoRedirect({
  href,
  delayMs = 1200,
}: {
  href: string;
  delayMs?: number;
}) {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => router.replace(href), delayMs);
    return () => clearTimeout(t);
  }, [href, delayMs, router]);
  return null;
}
