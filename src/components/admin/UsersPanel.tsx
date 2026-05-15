"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CARD, CARD_HEADER, INPUT_CLASS, SMALL_BTN } from "@/lib/ui";

interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passportNumber: string;
  photoPath: string | null;
  mustChangePassword: boolean;
  _count: { stamps: number; accolades: number };
}

export function UsersPanel({ users }: { users: UserRow[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) =>
      `${u.firstName} ${u.lastName} ${u.email} ${u.passportNumber}`
        .toLowerCase()
        .includes(term),
    );
  }, [q, users]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Search, view profiles, reset passwords, grant or remove stamps and
          accolades.
        </p>
      </div>

      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name, email, or passport number"
        className={INPUT_CLASS}
      />

      <section className={CARD}>
        <div className={CARD_HEADER}>
          <h2 className="text-sm font-medium">
            {filtered.length} of {users.length}
          </h2>
        </div>
        {filtered.length === 0 ? (
          <p className="px-4 py-6 text-sm text-stone-500 dark:text-stone-400">
            {users.length === 0 ? "No users yet." : "No matches."}
          </p>
        ) : (
          <ul className="divide-y divide-stone-200 dark:divide-stone-800">
            {filtered.map((u) => (
              <li
                key={u.id}
                className="grid items-center gap-3 px-4 py-3 sm:grid-cols-[auto_1fr_auto]"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                  {u.photoPath ? (
                    <Image
                      src={`/api/uploads/${u.photoPath}`}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">
                      {u.firstName[0]}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {u.firstName} {u.lastName}
                    {u.mustChangePassword && (
                      <span className="ml-1.5 text-xs font-normal text-amber-700 dark:text-amber-400">
                        · pw reset pending
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                    {u.email}
                    <span className="mx-2">·</span>
                    <span className="font-mono">{u.passportNumber}</span>
                    <span className="mx-2">·</span>
                    {u._count.stamps} stamps · {u._count.accolades} accolades
                  </p>
                </div>
                <Link href={`/admin/users/${u.id}`} className={SMALL_BTN}>
                  Manage
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
