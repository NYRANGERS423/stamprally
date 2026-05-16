"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import {
  stewardGrantAccoladeAction,
  type StewardGrantState,
} from "@/lib/actions/steward-accolades";
import { THEMES } from "@/lib/themes";

export interface TemplateOpt {
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
          href="/steward"
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
        >
          <BackArrow /> Steward
        </Link>
      </div>
      <p className="text-sm text-stone-600 dark:text-stone-400">
        Pick an accolade, then scan each recipient&apos;s passport QR or type
        their 6-character code. Camera stays on between users for rapid-fire
        groups.
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
  const [state, action, pending] = useActionState(stewardGrantAccoladeAction, {});
  const [code, setCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // After a successful grant, clear the code field so the steward can
  // scan the next recipient without a manual reset.
  const lastNonceRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (state.nonce && state.nonce !== lastNonceRef.current) {
      lastNonceRef.current = state.nonce;
      if (state.ok) setCode("");
    }
  }, [state.nonce, state.ok]);

  function submitWithCode(c: string) {
    const fd = new FormData();
    fd.set("templateId", template.id);
    fd.set("userCode", c);
    action(fd);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onChange}
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
        >
          <BackArrow /> Change accolade
        </button>
      </div>

      <SelectedTemplateHeader template={template} />

      {scanning ? (
        <Scanner
          onCode={(c) => {
            // QR payloads can be the full user URL or just an id; extract id.
            const id = extractUserId(c);
            setCode(id);
            submitWithCode(id);
          }}
          onClose={() => setScanning(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setScanning(true)}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 text-sm font-medium text-brand-700 hover:bg-brand-100 dark:border-brand-900/60 dark:bg-brand-900/30 dark:text-brand-300"
        >
          <CameraIcon /> Open camera
        </button>
      )}

      <form
        ref={formRef}
        action={action}
        className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
      >
        <input type="hidden" name="templateId" value={template.id} />
        <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
          Recipient code
        </label>
        <input
          ref={codeInputRef}
          name="userCode"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          inputMode="text"
          autoComplete="off"
          required
          minLength={6}
          maxLength={40}
          placeholder="6-char code from their passport"
          className="mt-1 block h-12 w-full rounded-md border-2 border-stone-300 bg-white px-3 font-mono text-lg tracking-wider shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-stone-700 dark:bg-stone-900"
        />
        <button
          type="submit"
          disabled={pending || code.trim().length === 0}
          className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full bg-stamp-600 px-5 text-sm font-medium text-white shadow-sm hover:bg-stamp-500 disabled:opacity-50"
        >
          {pending ? "Granting…" : "Grant accolade"}
        </button>
      </form>

      {state.error && <Flash kind="error" message={state.error} />}
      {state.ok && state.alreadyHad && (
        <Flash
          kind="duplicate"
          message={`${state.userName} already had ${state.templateLabel}`}
        />
      )}
      {state.ok && !state.alreadyHad && (
        <Flash
          kind="success"
          message={`Granted ${state.templateLabel} to ${state.userName}`}
        />
      )}
    </div>
  );
}

function SelectedTemplateHeader({ template }: { template: TemplateOpt }) {
  const accTheme =
    template.themeId && template.themeId in THEMES
      ? THEMES[template.themeId as keyof typeof THEMES]
      : null;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
      <span
        className={
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl " +
          (accTheme?.tagChipClass ??
            "bg-stamp-600/10 text-stamp-700 dark:bg-stamp-600/20 dark:text-stamp-500")
        }
      >
        {template.emoji ?? "★"}
      </span>
      <div className="min-w-0">
        <p className="text-base font-semibold">{template.label}</p>
        {template.description && (
          <p className="mt-0.5 text-xs text-stone-600 dark:text-stone-400">
            {template.description}
          </p>
        )}
        <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
          {template.event?.name ?? "Standalone"}
        </p>
      </div>
    </div>
  );
}

function Scanner({
  onCode,
  onClose,
}: {
  onCode: (code: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Throttle the same scanned code so a steady-held QR doesn't fire
  // 30× per second.
  const lastEmitRef = useRef<{ code: string; at: number } | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const scanner = new QrScanner(
      video,
      (r) => {
        const text = r.data.trim();
        if (!text) return;
        const now = Date.now();
        const last = lastEmitRef.current;
        if (last && last.code === text && now - last.at < 2500) return;
        lastEmitRef.current = { code: text, at: now };
        onCode(text);
      },
      { highlightScanRegion: true, highlightCodeOutline: true, preferredCamera: "environment" },
    );
    scannerRef.current = scanner;
    scanner.start().catch((e: unknown) => {
      setError(e instanceof Error ? e.message : "Couldn't start the camera");
    });
    return () => {
      scanner.stop();
      scanner.destroy();
      scannerRef.current = null;
    };
  }, [onCode]);

  return (
    <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-900 p-2 dark:border-stone-700">
      <video ref={videoRef} className="block w-full rounded-md" muted playsInline />
      <div className="flex items-center justify-between gap-2 px-1">
        <p className="text-xs text-stone-300">
          {error ? error : "Point at the recipient's passport QR"}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 items-center gap-1 rounded-full bg-white/10 px-3 text-xs font-medium text-white hover:bg-white/20"
        >
          Close camera
        </button>
      </div>
    </div>
  );
}

function Flash({
  kind,
  message,
}: {
  kind: "success" | "duplicate" | "error";
  message: string;
}) {
  const cls =
    kind === "success"
      ? "border-stamp-500/40 bg-stamp-50 text-stamp-800 dark:border-stamp-500/40 dark:bg-stamp-500/10 dark:text-stamp-500"
      : kind === "duplicate"
        ? "border-stone-300 bg-stone-50 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
        : "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200";
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${cls}`}>
      {message}
    </div>
  );
}

// QR payloads might be just the cuid, or a /u/<id> URL, or other shapes.
// Extract the id portion when we see a URL.
function extractUserId(raw: string): string {
  const m = raw.match(/\/u\/([^/?#]+)/);
  if (m) return m[1];
  return raw;
}

function BackArrow() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg
      width="18"
      height="18"
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
