"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin-guard";

export type DropdownKind = "department" | "company" | "region";

export interface DropdownFormState {
  error?: string;
  ok?: boolean;
}

const nameSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
});

function pathFor(kind: DropdownKind): string {
  return `/admin/dropdowns/${kind}s`;
}

async function createByKind(kind: DropdownKind, name: string): Promise<void> {
  switch (kind) {
    case "department":
      await db.department.create({ data: { name } });
      return;
    case "company":
      await db.company.create({ data: { name } });
      return;
    case "region":
      await db.region.create({ data: { name } });
      return;
  }
}

async function setActiveByKind(
  kind: DropdownKind,
  id: string,
  active: boolean,
): Promise<void> {
  switch (kind) {
    case "department":
      await db.department.update({ where: { id }, data: { active } });
      return;
    case "company":
      await db.company.update({ where: { id }, data: { active } });
      return;
    case "region":
      await db.region.update({ where: { id }, data: { active } });
      return;
  }
}

async function renameByKind(
  kind: DropdownKind,
  id: string,
  name: string,
): Promise<void> {
  switch (kind) {
    case "department":
      await db.department.update({ where: { id }, data: { name } });
      return;
    case "company":
      await db.company.update({ where: { id }, data: { name } });
      return;
    case "region":
      await db.region.update({ where: { id }, data: { name } });
      return;
  }
}

export async function createDropdownAction(
  kind: DropdownKind,
  _prev: DropdownFormState,
  formData: FormData,
): Promise<DropdownFormState> {
  await requireAdmin();
  const parsed = nameSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid name" };
  }
  try {
    await createByKind(kind, parsed.data.name);
  } catch {
    return { error: `A ${kind} with that name already exists` };
  }
  revalidatePath(pathFor(kind));
  return { ok: true };
}

export async function toggleDropdownAction(
  kind: DropdownKind,
  id: string,
  active: boolean,
): Promise<void> {
  await requireAdmin();
  await setActiveByKind(kind, id, active);
  revalidatePath(pathFor(kind));
}

export async function renameDropdownAction(
  kind: DropdownKind,
  id: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const parsed = nameSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  try {
    await renameByKind(kind, id, parsed.data.name);
  } catch {
    // ignore unique-constraint errors; UI shows stale name until refresh.
  }
  revalidatePath(pathFor(kind));
}
