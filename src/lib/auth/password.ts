import "server-only";
import { hash, verify } from "@node-rs/argon2";

const ARGON2_OPTS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
  outputLen: 32,
};

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, ARGON2_OPTS);
}

export async function verifyPassword(
  digest: string,
  plain: string,
): Promise<boolean> {
  try {
    return await verify(digest, plain);
  } catch {
    return false;
  }
}
