"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getUserSession } from "@/lib/auth/session";
import { buildPassportNumber } from "@/lib/auth/passport-number";
import { rateLimit } from "@/lib/rate-limit";

export interface AuthFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

const signupSchema = z
  .object({
    accessCode: z.string().trim().min(1, "Access code is required"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.string().email("Valid email required")),
    password: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .max(200),
    passwordConfirm: z.string(),
    firstName: z.string().trim().min(1, "First name is required").max(80),
    lastName: z.string().trim().min(1, "Last name is required").max(80),
    departmentId: z.string().min(1, "Department is required"),
    companyId: z.string().min(1, "Company is required"),
    regionId: z.string().min(1, "Region is required"),
    startDate: z.string().refine((v) => v && !Number.isNaN(Date.parse(v)), {
      message: "Valid start date is required",
    }),
    occupation: z
      .string()
      .max(120)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : null)),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Passwords must match",
  });

function collectFieldErrors(issues: z.ZodIssue[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.join(".");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

export async function signupAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: collectFieldErrors(parsed.error.issues) };
  }
  const data = parsed.data;

  // Validate dropdowns are still active
  const [dept, comp, reg] = await Promise.all([
    db.department.findUnique({ where: { id: data.departmentId } }),
    db.company.findUnique({ where: { id: data.companyId } }),
    db.region.findUnique({ where: { id: data.regionId } }),
  ]);
  if (!dept?.active || !comp?.active || !reg?.active) {
    return {
      error:
        "One of the selected options (department / company / region) is no longer available. Please refresh and try again.",
    };
  }

  // Email uniqueness
  const existing = await db.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return {
      fieldErrors: { email: "An account already exists with this email" },
    };
  }

  // Consume access code (transactional)
  const normalizedCode = data.accessCode.trim().toUpperCase();
  const ac = await db.accessCode.findUnique({
    where: { code: normalizedCode },
  });
  if (!ac) {
    return { fieldErrors: { accessCode: "Invalid access code" } };
  }
  if (!ac.enabled) {
    return { fieldErrors: { accessCode: "Access code is disabled" } };
  }
  if (ac.expiresAt && ac.expiresAt < new Date()) {
    return { fieldErrors: { accessCode: "Access code has expired" } };
  }
  if (ac.maxUses != null && ac.usesCount >= ac.maxUses) {
    return {
      fieldErrors: { accessCode: "Access code has reached its limit" },
    };
  }

  const passwordHash = await hashPassword(data.password);
  const startDate = new Date(data.startDate);

  let userId: string;
  try {
    const created = await db.$transaction(async (tx) => {
      await tx.accessCode.update({
        where: { id: ac.id },
        data: { usesCount: { increment: 1 } },
      });
      return tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          departmentId: data.departmentId,
          companyId: data.companyId,
          regionId: data.regionId,
          startDate,
          occupation: data.occupation,
          passportNumber: buildPassportNumber({
            companyName: comp.name,
            regionName: reg.name,
            startDate,
          }),
        },
      });
    });
    userId = created.id;
  } catch {
    // Unique-constraint collision on passport number is extremely unlikely with
    // 6 random digits but we retry once defensively.
    const fallback = await db.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        departmentId: data.departmentId,
        companyId: data.companyId,
        regionId: data.regionId,
        startDate,
        occupation: data.occupation,
        passportNumber: buildPassportNumber({
          companyName: comp.name,
          regionName: reg.name,
          startDate,
        }),
      },
    });
    userId = fallback.id;
  }

  const session = await getUserSession();
  session.userId = userId;
  session.mustChangePassword = false;
  await session.save();

  redirect("/passport");
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.string().email()),
  password: z.string().min(1),
});

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Invalid email or password" };
  }

  const rl = rateLimit({
    key: `login:${parsed.data.email}`,
    max: 5,
    windowMs: 60 * 1000,
  });
  if (!rl.ok) {
    return { error: "Too many attempts — wait a minute and try again" };
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user) return { error: "Invalid email or password" };

  const ok = await verifyPassword(user.passwordHash, parsed.data.password);
  if (!ok) return { error: "Invalid email or password" };

  const session = await getUserSession();
  session.userId = user.id;
  session.mustChangePassword = user.mustChangePassword;
  await session.save();

  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  if (user.mustChangePassword) {
    redirect("/force-change-password");
  }
  redirect("/passport");
}

export async function logoutAction() {
  const session = await getUserSession();
  session.destroy();
  redirect("/");
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .max(200),
    newPasswordConfirm: z.string(),
  })
  .refine((d) => d.newPassword === d.newPasswordConfirm, {
    path: ["newPasswordConfirm"],
    message: "Passwords must match",
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    path: ["newPassword"],
    message: "New password must differ from current password",
  });

export async function changePasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const session = await getUserSession();
  if (!session.userId) {
    redirect("/login");
  }
  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: collectFieldErrors(parsed.error.issues) };
  }
  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) redirect("/login");

  const ok = await verifyPassword(
    user.passwordHash,
    parsed.data.currentPassword,
  );
  if (!ok) {
    return {
      fieldErrors: { currentPassword: "Current password is incorrect" },
    };
  }

  const newHash = await hashPassword(parsed.data.newPassword);
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash, mustChangePassword: false },
  });
  session.mustChangePassword = false;
  await session.save();
  redirect("/passport");
}
