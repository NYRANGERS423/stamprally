import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-700 dark:text-brand-500">
          Stamprally
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Collect stamps at company events.
        </h1>
        <p className="mt-4 text-stone-600 dark:text-stone-400">
          Sign up, build your passport, and visit destinations to earn stamps.
          A little fun for the workplace.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="inline-flex h-11 items-center justify-center rounded-full bg-brand-600 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-50"
          >
            Get my passport
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-full border border-stone-300 px-6 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-100 dark:hover:bg-stone-900"
          >
            Sign in
          </Link>
        </div>

        <div className="mt-12 flex justify-center gap-6 text-xs">
          <Link
            href="/admin/login"
            className="text-stone-500 underline-offset-4 hover:text-stone-900 hover:underline dark:hover:text-stone-100"
          >
            Admin sign-in
          </Link>
          <Link
            href="/kiosk/login"
            className="text-stone-500 underline-offset-4 hover:text-stone-900 hover:underline dark:hover:text-stone-100"
          >
            Kiosk sign-in
          </Link>
        </div>
      </div>
    </main>
  );
}
