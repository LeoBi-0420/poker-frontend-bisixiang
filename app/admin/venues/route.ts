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
  const venue_name = String(formData.get("venue_name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "Atlanta").trim() || "Atlanta";
  const state = String(formData.get("state") ?? "GA").trim() || "GA";

  if (!venue_name) return errorRedirect(request, "Venue name is required");

  const res = await postBackend("/venues", { venue_name, address, city, state });
  if (!res.ok) {
    const text = await res.text();
    return errorRedirect(request, `Create venue failed (${res.status}): ${text}`);
  }

  return NextResponse.redirect(new URL("/admin?message=Venue+created", request.url));
}
