"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/access-codes", label: "Access codes" },
  { href: "/admin/dropdowns/departments", label: "Departments" },
  { href: "/admin/dropdowns/companies", label: "Companies" },
  { href: "/admin/dropdowns/regions", label: "Regions" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 text-sm">
      {NAV.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              "rounded-md px-3 py-2 transition-colors " +
              (active
                ? "bg-stone-200 font-medium text-stone-900 dark:bg-stone-800 dark:text-stone-100"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100")
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
