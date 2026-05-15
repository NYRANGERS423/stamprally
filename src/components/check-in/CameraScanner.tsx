"use client";

import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";

export function CameraScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    // Probe camera availability up-front so we can hide the button on
    // browsers that won't deliver one.
    QrScanner.hasCamera()
      .then((has) => setSupported(has))
      .catch(() => setSupported(false));
    return () => {
      scannerRef.current?.stop();
      scannerRef.current?.destroy();
      scannerRef.current = null;
    };
  }, []);

  async function start() {
    if (!videoRef.current) return;
    setError(null);
    setBusy(true);
    try {
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          handleScan(result.data);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: "environment",
          maxScansPerSecond: 5,
        },
      );
      scannerRef.current = scanner;
      await scanner.start();
      setScanning(true);
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : "Could not access the camera. Use the code below instead.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  function stop() {
    scannerRef.current?.stop();
    setScanning(false);
  }

  function handleScan(raw: string) {
    if (!raw) return;
    // The QR encodes an absolute /check-in/<token> URL. We accept anything
    // that ends in /check-in/<hex token>, regardless of origin, and follow
    // it. Token shape: 32 hex chars.
    const m = raw.match(/\/check-in\/([a-f0-9]{32})(?:[?#].*)?$/i);
    if (m) {
      scannerRef.current?.stop();
      window.location.assign(`/check-in/${m[1]}`);
      return;
    }
    // Anything else, surface as an error and keep scanning.
    setError("That QR isn't a Stamprally code. Try again or use the number.");
  }

  if (supported === false) {
    return null;
  }

  return (
    <div className="space-y-3">
      {!scanning && (
        <button
          type="button"
          onClick={start}
          disabled={busy || supported === null}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 active:bg-brand-700 disabled:opacity-50"
        >
          <CameraIcon />
          {busy ? "Opening camera…" : "Open camera"}
        </button>
      )}
      <div
        className={
          "relative overflow-hidden rounded-lg border-2 border-dashed bg-stone-900 " +
          (scanning ? "block" : "hidden") +
          " border-stone-300 aspect-square dark:border-stone-700"
        }
      >
        <video
          ref={videoRef}
          className="block h-full w-full object-cover"
          playsInline
          muted
        />
      </div>
      {scanning && (
        <button
          type="button"
          onClick={stop}
          className="inline-flex h-11 w-full items-center justify-center rounded-md border border-stone-300 px-4 text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          Stop scanning
        </button>
      )}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

function CameraIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
