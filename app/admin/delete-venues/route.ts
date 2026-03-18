import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, isAdminSessionValue } from "@/lib/admin-auth";
import { deleteBackend } from "@/lib/backend-admin";

function errorRedirect(request: Request, message: string) {
  const encoded = encodeURIComponent(message);
  return NextResponse.redirect(new URL(`/admin?error=${encoded}`, request.url));
}

function messageRedirect(request: Request, message: string) {
  const encoded = encodeURIComponent(message);
  return NextResponse.redirect(new URL(`/admin?message=${encoded}`, request.url));
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!isAdminSessionValue(session)) {
    return NextResponse.redirect(new URL("/admin/login?error=Please+sign+in", request.url));
  }

  const formData = await request.formData();
  const venueId = Number(formData.get("venue_id"));
  const venueName = String(formData.get("venue_name") ?? "").trim();

  if (!Number.isInteger(venueId) || venueId <= 0) {
    return errorRedirect(request, "Valid venue is required to delete");
  }

  const res = await deleteBackend(`/venues/${venueId}`);
  if (!res.ok) {
    const text = await res.text();
    return errorRedirect(request, `Delete venue failed (${res.status}): ${text}`);
  }

  return messageRedirect(request, `${venueName || `Venue #${venueId}`} deleted`);
}
