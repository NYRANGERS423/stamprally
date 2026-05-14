"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const OUTPUT_MAX_PX = 1500;

interface Vec {
  x: number;
  y: number;
}

interface Override {
  scale: number;
  offset: Vec;
}

export function ImageCropper({
  file,
  saving,
  onCrop,
  onCancel,
}: {
  file: File;
  saving: boolean;
  onCrop: (blob: Blob) => Promise<void> | void;
  onCancel: () => void;
}) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ startClient: Vec; startOffset: Vec } | null>(null);

  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [vpSize, setVpSize] = useState<number>(280);
  const [override, setOverride] = useState<Override | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // createObjectURL/revokeObjectURL must be paired in an effect to clean up
    // when the cropper unmounts. There is no derivable equivalent.
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    function measure() {
      const el = viewportRef.current;
      if (!el) return;
      setVpSize(el.getBoundingClientRect().width);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const base = useMemo(() => {
    if (!natural || vpSize === 0) return null;
    const minS = Math.max(vpSize / natural.w, vpSize / natural.h);
    return {
      minScale: minS,
      maxScale: minS * 4,
      defaultScale: minS,
      defaultOffset: {
        x: (vpSize - natural.w * minS) / 2,
        y: (vpSize - natural.h * minS) / 2,
      },
    };
  }, [natural, vpSize]);

  const scale = override?.scale ?? base?.defaultScale ?? 1;
  const offset = override?.offset ?? base?.defaultOffset ?? { x: 0, y: 0 };
  const minScale = base?.minScale ?? 1;
  const maxScale = base?.maxScale ?? 4;

  function onImageLoad() {
    const img = imgRef.current;
    if (!img) return;
    setNatural({ w: img.naturalWidth, h: img.naturalHeight });
  }

  function clampOffset(off: Vec, s: number): Vec {
    if (!natural) return off;
    const iw = natural.w * s;
    const ih = natural.h * s;
    const minX = vpSize - iw;
    const minY = vpSize - ih;
    return {
      x: Math.min(0, Math.max(minX, off.x)),
      y: Math.min(0, Math.max(minY, off.y)),
    };
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!natural) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startClient: { x: e.clientX, y: e.clientY },
      startOffset: offset,
    };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startClient.x;
    const dy = e.clientY - dragRef.current.startClient.y;
    const newOff = clampOffset(
      {
        x: dragRef.current.startOffset.x + dx,
        y: dragRef.current.startOffset.y + dy,
      },
      scale,
    );
    setOverride({ scale, offset: newOff });
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    dragRef.current = null;
  }

  function onScaleChange(newScale: number) {
    if (!natural) return;
    const cx = vpSize / 2;
    const cy = vpSize / 2;
    const imgPx = (cx - offset.x) / scale;
    const imgPy = (cy - offset.y) / scale;
    const newOff = clampOffset(
      {
        x: cx - imgPx * newScale,
        y: cy - imgPy * newScale,
      },
      newScale,
    );
    setOverride({ scale: newScale, offset: newOff });
  }

  async function handleSave() {
    setError(null);
    const img = imgRef.current;
    if (!natural || !img) return;
    const sourceSize = vpSize / scale;
    const sourceX = -offset.x / scale;
    const sourceY = -offset.y / scale;
    const outputSize = Math.min(Math.round(sourceSize), OUTPUT_MAX_PX);
    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("Browser does not support canvas rendering");
      return;
    }
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      outputSize,
      outputSize,
    );
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92);
    });
    if (!blob) {
      setError("Could not generate the cropped image");
      return;
    }
    await onCrop(blob);
  }

  const sliderStep = Math.max((maxScale - minScale) / 200, 0.0001);

  return (
    <div className="space-y-3">
      <div
        ref={viewportRef}
        className="relative mx-auto aspect-square w-full max-w-[340px] cursor-grab touch-none select-none overflow-hidden rounded-lg border-2 border-stone-300 bg-stone-900 active:cursor-grabbing dark:border-stone-700"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {imgUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            ref={imgRef}
            src={imgUrl}
            alt=""
            onLoad={onImageLoad}
            draggable={false}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
              transformOrigin: "0 0",
              userSelect: "none",
              pointerEvents: "none",
              maxWidth: "none",
              willChange: "transform",
            }}
          />
        )}
        <div className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-white/70 mix-blend-difference" />
      </div>

      <div>
        <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
          Zoom
        </label>
        <input
          type="range"
          min={minScale}
          max={maxScale}
          step={sliderStep}
          value={scale}
          onChange={(e) => onScaleChange(Number.parseFloat(e.target.value))}
          disabled={!natural}
          className="mt-1 block w-full accent-brand-600"
        />
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          Drag to position. The framed area becomes your passport photo.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !natural}
          className="inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 active:bg-brand-700 disabled:opacity-50"
        >
          {saving ? "Uploading…" : "Save photo"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="inline-flex h-11 items-center justify-center rounded-md border border-stone-300 px-4 text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 disabled:opacity-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
