import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, isAdminSessionValue } from "@/lib/admin-auth";
import { postBackend } from "@/lib/backend-admin";

function errorRedirect(request: Request, message: string) {
  const encoded = encodeURIComponent(message);
  return NextResponse.redirect(new URL(`/admin?error=${encoded}`, request.url));
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!isAdminSessionValue(session)) {
    return NextResponse.redirect(new URL("/admin/login?error=Please+sign+in", request.url));
  }

  const formData = await request.formData();
  const display_name = String(formData.get("display_name") ?? "").trim();
  const avatar_url = String(formData.get("avatar_url") ?? "").trim() || null;

  if (!display_name) return errorRedirect(request, "Player name is required");

  const res = await postBackend("/players", { display_name, avatar_url });
  if (!res.ok) {
    const text = await res.text();
    return errorRedirect(request, `Create player failed (${res.status}): ${text}`);
  }

  return NextResponse.redirect(new URL("/admin?message=Player+created", request.url));
}
