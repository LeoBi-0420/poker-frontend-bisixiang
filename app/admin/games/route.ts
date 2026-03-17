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
  const game_title = String(formData.get("game_title") ?? "").trim();
  const startRaw = String(formData.get("start_time") ?? "").trim();
  const venue_id = Number(formData.get("venue_id"));
  const buyRaw = String(formData.get("buy_in") ?? "").trim();
  const buy_in = buyRaw ? Number(buyRaw) : 0;

  if (!game_title) return errorRedirect(request, "Game title is required");
  if (!startRaw) return errorRedirect(request, "Start time is required");
  if (!Number.isInteger(venue_id) || venue_id <= 0) {
    return errorRedirect(request, "Valid venue is required");
  }
  if (Number.isNaN(buy_in) || buy_in < 0) {
    return errorRedirect(request, "Buy-in must be a non-negative number");
  }

  const parsedStart = new Date(startRaw);
  if (Number.isNaN(parsedStart.getTime())) {
    return errorRedirect(request, "Invalid start time");
  }

  const res = await postBackend("/games", {
    game_title,
    start_time: parsedStart.toISOString(),
    venue_id,
    buy_in,
  });
  if (!res.ok) {
    const text = await res.text();
    return errorRedirect(request, `Create game failed (${res.status}): ${text}`);
  }

  return NextResponse.redirect(new URL("/admin?message=Game+created", request.url));
}
