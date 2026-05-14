import { type SignatureData } from "@/lib/signature";

export function SignatureRender({
  data,
  className,
}: {
  data: SignatureData;
  className?: string;
}) {
  return (
    <svg
      viewBox={data.vb}
      className={className ?? "block h-12 w-full text-stone-900 dark:text-stone-100"}
      preserveAspectRatio="xMidYMid meet"
      aria-label="Signature"
    >
      {data.paths.map((d, i) => (
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
  );
}
