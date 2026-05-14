"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import {
  removeSignatureAction,
  saveSignatureAction,
  type SignatureFormState,
} from "@/lib/actions/passport-signature";
import { SIGNATURE_VIEWBOX, parseSignature } from "@/lib/signature";

const initial: SignatureFormState = {};

const VB_W = 300;
const VB_H = 100;

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

export function SignatureCanvas({ initialJson }: { initialJson: string | null }) {
  const initialData = parseSignature(initialJson);
  const [paths, setPaths] = useState<string[]>(initialData?.paths ?? []);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [state, action, pending] = useActionState(saveSignatureAction, initial);
  const [removing, startRemove] = useTransition();
  const [hasSaved, setHasSaved] = useState<boolean>(initialData !== null);

  function toSvgCoords(e: React.PointerEvent<SVGSVGElement>): { x: number; y: number } {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };
    const x = ((e.clientX - rect.left) / rect.width) * VB_W;
    const y = ((e.clientY - rect.top) / rect.height) * VB_H;
    return { x: round(x), y: round(y) };
  }

  function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = toSvgCoords(e);
    setCurrentPath(`M${x},${y}`);
  }

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (currentPath == null) return;
    const { x, y } = toSvgCoords(e);
    setCurrentPath((d) => (d ? `${d} L${x},${y}` : `M${x},${y}`));
  }

  function onPointerUp(e: React.PointerEvent<SVGSVGElement>) {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (currentPath) {
      setPaths((prev) => [...prev, currentPath]);
    }
    setCurrentPath(null);
  }

  function clearLocal() {
    setPaths([]);
    setCurrentPath(null);
  }

  const allPaths = currentPath ? [...paths, currentPath] : paths;
  const json = JSON.stringify({ vb: SIGNATURE_VIEWBOX, paths });
  const empty = paths.length === 0 && currentPath == null;

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 dark:border-stone-700 dark:bg-stone-900/40">
        <svg
          ref={svgRef}
          viewBox={SIGNATURE_VIEWBOX}
          className="block aspect-[3/1] w-full touch-none select-none text-stone-900 dark:text-stone-100"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {allPaths.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
        {empty && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-stone-400 dark:text-stone-500">
            Sign here
          </p>
        )}
      </div>

      <form action={action} className="space-y-3">
        <input type="hidden" name="signatureJson" value={json} />
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={pending || empty}
            className="inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 active:bg-brand-700 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save signature"}
          </button>
          <button
            type="button"
            onClick={clearLocal}
            disabled={empty}
            className="inline-flex h-11 items-center justify-center rounded-md border border-stone-300 px-4 text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 disabled:opacity-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            Clear
          </button>
          {hasSaved && (
            <button
              type="button"
              disabled={removing}
              onClick={() => {
                if (!confirm("Remove your saved signature?")) return;
                startRemove(async () => {
                  await removeSignatureAction();
                  clearLocal();
                  setHasSaved(false);
                });
              }}
              className="ml-auto inline-flex h-11 items-center justify-center rounded-md border border-red-300 px-4 text-sm font-medium text-red-700 hover:bg-red-50 active:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              {removing ? "Removing…" : "Remove saved"}
            </button>
          )}
        </div>
        {state.error && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        )}
        {state.ok && (
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            Signature saved.
          </p>
        )}
      </form>
    </div>
  );
}
