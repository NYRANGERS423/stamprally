import Link from "next/link";

type AuthKind = "user" | "admin";

const SIGNINS: Record<AuthKind, { label: string; href: string }> = {
  user: { label: "User sign-in", href: "/login" },
  admin: { label: "Admin sign-in", href: "/admin/login" },
};

const ORDER: AuthKind[] = ["user", "admin"];

export function AuthChooserFooter({ current }: { current: AuthKind }) {
  const others = ORDER.filter((k) => k !== current);
  return (
    <div className="space-y-3 border-t border-stone-200 pt-4 dark:border-stone-800">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
        <span className="text-stone-500 dark:text-stone-400">
          Looking for a different sign-in?
        </span>
        {others.map((k) => (
          <Link
            key={k}
            href={SIGNINS[k].href}
            className="font-medium text-stone-700 underline-offset-4 hover:text-stone-900 hover:underline dark:text-stone-300 dark:hover:text-stone-100"
          >
            {SIGNINS[k].label}
          </Link>
        ))}
      </div>
      <div className="flex justify-center">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-md border border-stone-300 bg-white px-5 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-100 active:bg-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
