"use client";

import Image from "next/image";
import { useActionState, useRef, useState, useTransition } from "react";
import {
  removePhotoAction,
  uploadPhotoAction,
  type PassportEditState,
} from "@/lib/actions/passport-edit";
import { ImageCropper } from "./ImageCropper";

const initial: PassportEditState = {};

export function PhotoUploader({
  currentPath,
  maxMb,
}: {
  currentPath: string | null;
  maxMb: number;
}) {
  const [state, action, pending] = useActionState(uploadPhotoAction, initial);
  const [picking, setPicking] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [removing, startRemove] = useTransition();
  const [pickError, setPickError] = useState<string | null>(null);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // allow re-picking the same file
    if (!file.type.startsWith("image/")) {
      setPickError("Pick an image file");
      return;
    }
    if (file.size > maxMb * 1024 * 1024) {
      setPickError(
        `Photo is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is ${maxMb} MB.`,
      );
      return;
    }
    setPickError(null);
    setPicking(file);
  }

  async function onCrop(blob: Blob) {
    const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
    const fd = new FormData();
    fd.set("photo", file);
    setPicking(null);
    action(fd);
  }

  if (picking) {
    return (
      <ImageCropper
        file={picking}
        saving={pending}
        onCrop={onCrop}
        onCancel={() => setPicking(null)}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-stone-300 bg-stone-100 dark:border-stone-700 dark:bg-stone-800">
          {currentPath ? (
            <Image
              src={`/api/uploads/${currentPath}`}
              alt="Current photo"
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">
              No photo
            </div>
          )}
        </div>
        <div className="flex-1 text-xs text-stone-600 dark:text-stone-400">
          Pick a photo, then drag and zoom to position. Max {maxMb} MB.
        </div>
      </div>

      {pickError && (
        <p className="text-xs text-red-600 dark:text-red-400">{pickError}</p>
      )}
      {state.error && (
        <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state.ok && (
        <p className="text-xs text-emerald-700 dark:text-emerald-400">
          Photo updated.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 active:bg-brand-700">
          {currentPath ? "Change photo" : "Pick a photo"}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPickFile}
          />
        </label>
        {currentPath && (
          <button
            type="button"
            disabled={removing}
            onClick={() => {
              if (!confirm("Remove your photo?")) return;
              startRemove(async () => {
                await removePhotoAction();
              });
            }}
            className="inline-flex h-11 items-center justify-center rounded-md border border-red-300 px-4 text-sm font-medium text-red-700 hover:bg-red-50 active:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
