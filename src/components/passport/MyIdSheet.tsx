"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function MyIdSheet({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const shortCode = userId.slice(-6).toUpperCase();

  useEffect(() => {
    if (!open || qr) return;
    let cancelled = false;
    QRCode.toDataURL(userId, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 480,
      color: { dark: "#1c1917", light: "#ffffff" },
    })
      .then((dataUrl) => {
        if (!cancelled) setQr(dataUrl);
      })
      .catch(() => {
        // Fall back to short-code only if QR rendering fails.
      });
    return () => {
      cancelled = true;
    };
  }, [open, qr, userId]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50 active:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
      >
        <QrIcon />
        Show my ID
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="My passport ID"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-stone-900"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500 dark:text-stone-400">
              Show this at a kiosk
            </p>
            <p className="mt-1 text-center text-lg font-semibold">{name}</p>
            <div className="mx-auto mt-4 aspect-square w-full max-w-[280px] overflow-hidden rounded-lg border border-stone-200 bg-white dark:border-stone-800">
              {qr ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qr}
                  alt="Your passport QR"
                  className="block h-full w-full"
                />
              ) : (
                <div className="h-full w-full animate-pulse bg-stone-100 dark:bg-stone-800" />
              )}
            </div>
            <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500 dark:text-stone-400">
              Or read out
            </p>
            <p className="mt-1 text-center font-mono text-3xl font-bold tracking-[0.3em] text-stone-900 dark:text-stone-100">
              {shortCode}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function QrIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3" />
      <path d="M21 14v.01" />
      <path d="M14 21h.01" />
      <path d="M17 17h4v4" />
    </svg>
  );
}
