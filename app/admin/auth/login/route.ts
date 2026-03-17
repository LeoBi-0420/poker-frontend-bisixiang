import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  expectedAdminCookieValue,
  isValidAdminPassword,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL("/admin/login?error=Missing+ADMIN_PASSWORD", request.url));
  }

  if (!isValidAdminPassword(password)) {
    return NextResponse.redirect(new URL("/admin/login?error=Invalid+password", request.url));
  }

  const sessionValue = expectedAdminCookieValue();
  if (!sessionValue) {
    return NextResponse.redirect(new URL("/admin/login?error=Missing+ADMIN_PASSWORD", request.url));
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 60 * 12,
  });

  return NextResponse.redirect(new URL("/admin", request.url));
}
