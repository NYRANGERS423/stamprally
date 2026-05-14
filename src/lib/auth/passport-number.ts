import "server-only";
import { randomBytes } from "node:crypto";

// Format: <COMPANY>-<REGION>-<YEAR>-<6-DIGIT>
// e.g. APM-NL-2026-038472
export function buildPassportNumber(opts: {
  companyName: string;
  regionName: string;
  startDate: Date;
}): string {
  const company = codeFrom(opts.companyName, 3);
  const region = codeFrom(opts.regionName, 2);
  const year = opts.startDate.getUTCFullYear();
  const seq = randomDigits(6);
  return `${company}-${region}-${year}-${seq}`;
}

function codeFrom(name: string, length: number): string {
  const cleaned = name.replace(/[^A-Za-z0-9]+/g, "").toUpperCase();
  if (cleaned.length >= length) return cleaned.slice(0, length);
  return (cleaned + "XXXXX").slice(0, length);
}

function randomDigits(length: number): string {
  const max = 10 ** length;
  const bytes = randomBytes(4).readUInt32BE(0);
  return String(bytes % max).padStart(length, "0");
}
