import { createHash, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_NAME = "poker_admin_session";

function tokenForPassword(password: string): string {
  return createHash("sha256").update(`poker-admin:${password}`).digest("hex");
}

export function adminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function isValidAdminPassword(password: string): boolean {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) return false;

  const incoming = Buffer.from(tokenForPassword(password), "utf8");
  const expected = Buffer.from(tokenForPassword(configured), "utf8");
  return incoming.length === expected.length && timingSafeEqual(incoming, expected);
}

export function expectedAdminCookieValue(): string | null {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) return null;
  return tokenForPassword(configured);
}

export function isAdminSessionValue(value: string | undefined): boolean {
  if (!adminPasswordConfigured()) {
    return true;
  }

  if (!value) return false;
  const expected = expectedAdminCookieValue();
  if (!expected) return false;

  const incoming = Buffer.from(value, "utf8");
  const target = Buffer.from(expected, "utf8");
  return incoming.length === target.length && timingSafeEqual(incoming, target);
}
