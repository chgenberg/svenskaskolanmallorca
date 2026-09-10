import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const FIESTA_COOKIE = "fiesta_session";

export function fiestaPasswordConfigured() {
  return Boolean(process.env.FIESTA_PASSWORD?.trim());
}

function expectedToken() {
  const password = process.env.FIESTA_PASSWORD?.trim() ?? "";
  if (!password) return "";
  return createHmac("sha256", password).update("svenska-skolan-fiesta-v1").digest("hex");
}

export function passwordMatches(input: string) {
  const expected = process.env.FIESTA_PASSWORD?.trim() ?? "";
  const got = input.trim();
  if (!expected || !got || expected.length !== got.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(got));
}

export async function fiestaUnlocked() {
  const token = expectedToken();
  if (!token) return false;
  const jar = await cookies();
  const got = jar.get(FIESTA_COOKIE)?.value ?? "";
  if (!got || got.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(token));
}

export async function setFiestaSession() {
  const token = expectedToken();
  if (!token) return;
  const jar = await cookies();
  jar.set(FIESTA_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearFiestaSession() {
  const jar = await cookies();
  jar.delete(FIESTA_COOKIE);
}
