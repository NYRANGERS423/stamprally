"use client";

import Image from "next/image";
import { useActionState, useRef, useState, useTransition } from "react";
import {
  removePhotoAction,
  uploadPhotoAction,
  type PassportEditState,
} from "@/lib/actions/passport-edit";

const initial: PassportEditState = {};

export function PhotoUploader({
  currentPath,
  maxMb,
}: {
  currentPath: string | null;
  maxMb: number;
}) {
  const [state, action, pending] = useActionState(uploadPhotoAction, initial);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [removing, startRemove] = useTransition();

  const display = previewUrl ?? (currentPath ? `/api/uploads/${currentPath}` : null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-stone-300 bg-stone-100 dark:border-stone-700 dark:bg-stone-800">
          {display ? (
            previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={display}
                alt="Photo preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={display}
                alt="Current photo"
                fill
                sizes="96px"
                className="object-cover"
              />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">
              No photo
            </div>
          )}
        </div>
        <div className="flex-1 text-xs text-stone-600 dark:text-stone-400">
          Square images work best. Auto-cropped to centre. Max {maxMb} MB.
        </div>
      </div>

      <form ref={formRef} action={action} className="space-y-3">
        <input
          ref={fileInputRef}
          name="photo"
          type="file"
          accept="image/*"
          required
          onChange={onPick}
          className="block w-full text-sm text-stone-700 file:mr-3 file:rounded-md file:border-0 file:bg-stone-200 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-stone-900 hover:file:bg-stone-300 dark:text-stone-300 dark:file:bg-stone-700 dark:file:text-stone-100 dark:hover:file:bg-stone-600"
        />
        {state.error && (
          <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>
        )}
        {state.ok && !previewUrl && (
          <p className="text-xs text-emerald-700 dark:text-emerald-400">
            Photo updated.
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending || !previewUrl}
            className="inline-flex h-9 items-center justify-center rounded-md bg-brand-600 px-3 text-xs font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
          >
            {pending ? "Uploading…" : "Save photo"}
          </button>
          {currentPath && (
            <button
              type="button"
              disabled={removing}
              onClick={() => {
                if (!confirm("Remove your photo?")) return;
                startRemove(async () => {
                  await removePhotoAction();
                  setPreviewUrl(null);
                  if (formRef.current) formRef.current.reset();
                });
              }}
              className="inline-flex h-9 items-center justify-center rounded-md border border-red-300 px-3 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Remove
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
