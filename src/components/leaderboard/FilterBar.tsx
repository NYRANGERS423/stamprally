"use client";

import { useRouter } from "next/navigation";
import type { RangeOption } from "@/lib/leaderboard";

export function LeaderboardFilterBar({
  ranges,
  events,
  selectedRange,
  selectedEvent,
}: {
  ranges: RangeOption[];
  events: Array<{ id: string; name: string; active: boolean }>;
  selectedRange: string;
  selectedEvent: string;
}) {
  const router = useRouter();

  function setParam(which: "range" | "event", value: string) {
    const params = new URLSearchParams();
    const next = {
      range: which === "range" ? value : selectedRange,
      event: which === "event" ? value : selectedEvent,
    };
    if (next.range !== "all") params.set("range", next.range);
    if (next.event !== "all") params.set("event", next.event);
    const qs = params.toString();
    router.push(qs ? `/leaderboard?${qs}` : "/leaderboard");
  }

  return (
    <div className="grid gap-3 rounded-xl border border-stone-200 bg-white p-3 sm:grid-cols-2 dark:border-stone-800 dark:bg-stone-900">
      <Select
        label="When"
        value={selectedRange}
        onChange={(v) => setParam("range", v)}
        options={ranges.map((r) => ({ value: r.key, label: r.label }))}
      />
      <Select
        label="Event"
        value={selectedEvent}
        onChange={(v) => setParam("event", v)}
        options={[
          { value: "all", label: "All events" },
          ...events.map((e) => ({
            value: e.id,
            label: e.active ? e.name : `${e.name} (inactive)`,
          })),
        ]}
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-md border border-stone-300 bg-white px-3 text-sm font-medium dark:border-stone-700 dark:bg-stone-900"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
