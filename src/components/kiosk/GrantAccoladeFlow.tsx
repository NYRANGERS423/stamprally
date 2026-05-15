"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import {
  kioskGrantAccoladeAction,
  type KioskGrantState,
} from "@/lib/actions/kiosk-accolades";
import { THEMES } from "@/lib/themes";

interface TemplateOpt {
  id: string;
  label: string;
  description: string | null;
  emoji: string | null;
  themeId: string | null;
  event: { id: string; name: string } | null;
}

export function GrantAccoladeFlow({ templates }: { templates: TemplateOpt[] }) {
  const [selected, setSelected] = useState<TemplateOpt | null>(null);

  if (!selected) {
    return <PickTemplate templates={templates} onPick={setSelected} />;
  }
  return (
    <ScanAndGrant template={selected} onChange={() => setSelected(null)} />
  );
}

function PickTemplate({
  templates,
  onPick,
}: {
  templates: TemplateOpt[];
  onPick: (t: TemplateOpt) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Give accolade</h1>
        <Link
          href="/kiosk"
          className="inline-flex h-10 items-center rounded-md border border-stone-300 px-3 text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          ← Kiosk home
        </Link>
      </div>
      <p className="text-sm text-stone-600 dark:text-stone-400">
        Pick an accolade, then scan or enter each user&apos;s passport code to
        hand it out.
      </p>
      {templates.length === 0 ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          No active accolades in the catalog. An admin needs to add some at{" "}
          <span className="font-mono">/admin/accolades</span>.
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {templates.map((t) => {
            const accTheme =
              t.themeId && t.themeId in THEMES
                ? THEMES[t.themeId as keyof typeof THEMES]
                : null;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onPick(t)}
                  className="w-full rounded-xl border border-stone-200 bg-white p-4 text-left transition-colors hover:border-brand-500 hover:bg-brand-50 active:bg-brand-100 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-brand-500 dark:hover:bg-brand-900/30"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl " +
                        (accTheme?.tagChipClass ??
                          "bg-stamp-600/10 text-stamp-700 dark:bg-stamp-600/20 dark:text-stamp-500")
                      }
                    >
                      {t.emoji ?? "★"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{t.label}</p>
                      {t.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-stone-600 dark:text-stone-400">
                          {t.description}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
                        {t.event?.name ?? "Standalone"}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ScanAndGrant({
  template,
  onChange,
}: {
  template: TemplateOpt;
  onChange: () => void;
}) {
  const accTheme =
    template.themeId && template.themeId in THEMES
      ? THEMES[template.themeId as keyof typeof THEMES]
      : null;
  const [state, action, pending] = useActionState<KioskGrantState, FormData>(
    kioskGrantAccoladeAction,
    {},
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [scanning, setScanning] = useState(false);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const lastScanRef = useRef<{ value: string; at: number }>({
    value: "",
    at: 0,
  });

  useEffect(() => {
    QrScanner.hasCamera()
      .then((has) => setSupported(has))
      .catch(() => setSupported(false));
    return () => {
      scannerRef.current?.stop();
      scannerRef.current?.destroy();
      scannerRef.current = null;
    };
  }, []);

  async function startScan() {
    if (!videoRef.current) return;
    setScanError(null);
    try {
      const scanner = new QrScanner(
        videoRef.current,
        (result) => handleScan(result.data),
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
      setScanError(
        e instanceof Error ? e.message : "Could not access the camera",
      );
    }
  }

  function stopScan() {
    scannerRef.current?.stop();
    setScanning(false);
  }

  function handleScan(raw: string) {
    if (!raw) return;
    // Extract a user id or short code from the scanned text. Accept:
    //   - raw cuid           (a-z0-9, ~24-25 chars)
    //   - /u/<cuid> URL      (in case we ever encode QR as a URL)
    //   - 6-char short code  (a-z0-9, last 6 of cuid)
    let value = raw.trim();
    const urlMatch = value.match(/\/u\/([a-z0-9]+)(?:[?#].*)?$/i);
    if (urlMatch) value = urlMatch[1];
    if (!/^[a-z0-9]{6,}$/i.test(value)) {
      setScanError("That QR doesn't look like a passport ID.");
      return;
    }
    // Debounce identical reads within 2.5s to avoid double-grants from the
    // scanner firing on every frame while a QR is in view.
    const now = Date.now();
    if (
      lastScanRef.current.value === value &&
      now - lastScanRef.current.at < 2500
    ) {
      return;
    }
    lastScanRef.current = { value, at: now };
    submitCode(value);
  }

  function submitCode(value: string) {
    if (!formRef.current) return;
    if (codeInputRef.current) codeInputRef.current.value = value;
    formRef.current.requestSubmit();
  }

  // After each successful grant, clear the input so the next scan is fresh.
  useEffect(() => {
    if (state.nonce && state.ok && codeInputRef.current) {
      codeInputRef.current.value = "";
    }
  }, [state.nonce, state.ok]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Hand out accolades
        </h1>
        <button
          type="button"
          onClick={() => {
            stopScan();
            onChange();
          }}
          className="inline-flex h-10 items-center rounded-md border border-stone-300 px-3 text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          Change accolade
        </button>
      </div>

      <div
        className={
          "flex items-center gap-3 rounded-2xl border p-4 " +
          (accTheme?.tagChipClass ??
            "border-stamp-200 bg-stamp-50 dark:border-stamp-800 dark:bg-stamp-900/30")
        }
      >
        <span className="text-3xl" aria-hidden>
          {template.emoji ?? "★"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{template.label}</p>
          <p className="text-[11px] font-medium uppercase tracking-wider opacity-80">
            {template.event?.name ?? "Standalone"}
          </p>
        </div>
      </div>

      <form
        ref={formRef}
        action={action}
        className="space-y-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
      >
        <input type="hidden" name="templateId" value={template.id} />

        {supported !== false && (
          <>
            <div
              className={
                "relative overflow-hidden rounded-lg border-2 border-dashed bg-stone-900 aspect-square " +
                (scanning ? "block" : "hidden") +
                " border-stone-300 dark:border-stone-700"
              }
            >
              <video
                ref={videoRef}
                className="block h-full w-full object-cover"
                playsInline
                muted
              />
            </div>
            {!scanning ? (
              <button
                type="button"
                onClick={startScan}
                disabled={supported === null}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 active:bg-brand-700 disabled:opacity-50"
              >
                Open camera & scan
              </button>
            ) : (
              <button
                type="button"
                onClick={stopScan}
                className="inline-flex h-11 w-full items-center justify-center rounded-md border border-stone-300 px-4 text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                Stop scanning
              </button>
            )}
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
              <span className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
                or
              </span>
              <span className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
            </div>
          </>
        )}

        <div>
          <label
            htmlFor="userCode"
            className="block text-xs font-medium text-stone-700 dark:text-stone-300"
          >
            Passport code
          </label>
          <input
            id="userCode"
            ref={codeInputRef}
            name="userCode"
            required
            minLength={6}
            maxLength={40}
            autoComplete="off"
            placeholder="ABC123"
            className="mt-1 block h-14 w-full rounded-md border-2 border-stone-300 bg-white text-center font-mono text-2xl font-bold uppercase tracking-[0.3em] shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-stone-700 dark:bg-stone-900"
          />
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            6-letter code on the user&apos;s passport.
          </p>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 w-full items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50"
        >
          {pending ? "Granting…" : "Grant accolade"}
        </button>
      </form>

      <ResultBanner state={state} scanError={scanError} />
    </div>
  );
}

function ResultBanner({
  state,
  scanError,
}: {
  state: KioskGrantState;
  scanError: string | null;
}) {
  if (scanError) {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
        {scanError}
      </div>
    );
  }
  if (state.error) {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
        {state.error}
      </div>
    );
  }
  if (state.ok && state.userName) {
    if (state.alreadyHad) {
      return (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          <strong>{state.userName}</strong> already had{" "}
          <em>{state.templateLabel}</em>.
        </div>
      );
    }
    return (
      <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
        Granted <em>{state.templateLabel}</em> to{" "}
        <strong>{state.userName}</strong>.
      </div>
    );
  }
  return null;
}
