import Link from "next/link";
import { kioskLogoutAction } from "@/lib/actions/kiosk-auth";

export function KioskTopBar({ username }: { username: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur dark:border-stone-800 dark:bg-stone-900/95">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <Link href="/kiosk" className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand-700 dark:text-brand-500">
            Stamprally · Kiosk
          </span>
          <span className="hidden text-xs text-stone-500 sm:inline dark:text-stone-400">
            @{username}
          </span>
        </Link>
        <form action={kioskLogoutAction}>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
