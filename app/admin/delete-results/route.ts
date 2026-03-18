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
  const gameId = Number(formData.get("game_id"));
  const playerId = Number(formData.get("player_id"));

  if (!Number.isInteger(gameId) || gameId <= 0) {
    return errorRedirect(request, "Valid game is required to delete a result");
  }
  if (!Number.isInteger(playerId) || playerId <= 0) {
    return errorRedirect(request, "Valid player is required to delete a result");
  }

  const res = await deleteBackend(`/games/${gameId}/results/${playerId}`);
  if (!res.ok) {
    const text = await res.text();
    return errorRedirect(request, `Delete result failed (${res.status}): ${text}`);
  }

  return messageRedirect(request, "Result deleted");
}
