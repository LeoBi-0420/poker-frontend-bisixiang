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
  const game_id = Number(formData.get("game_id"));
  const player_id = Number(formData.get("player_id"));
  const finish_rank = Number(formData.get("finish_rank"));
  const points = Number(formData.get("points"));
  const kos = Number(formData.get("kos"));

  const eliminatedRaw = String(formData.get("eliminated_by_player_id") ?? "").trim();
  const eliminatedBy = eliminatedRaw ? Number(eliminatedRaw) : null;

  if (!Number.isInteger(game_id) || game_id <= 0) return errorRedirect(request, "Valid game is required");
  if (!Number.isInteger(player_id) || player_id <= 0) return errorRedirect(request, "Valid player is required");
  if (!Number.isInteger(finish_rank) || finish_rank <= 0) return errorRedirect(request, "Valid rank is required");
  if (!Number.isInteger(points)) return errorRedirect(request, "Points must be an integer");
  if (!Number.isInteger(kos) || kos < 0) return errorRedirect(request, "KOs must be 0 or greater");
  if (eliminatedBy !== null && (!Number.isInteger(eliminatedBy) || eliminatedBy <= 0)) {
    return errorRedirect(request, "Eliminated by player must be a valid player");
  }

  const res = await postBackend(`/games/${game_id}/results`, [
    {
      finish_rank,
      player_id,
      points,
      kos,
      eliminated_by_player_id: eliminatedBy,
    },
  ]);

  if (!res.ok) {
    const text = await res.text();
    return errorRedirect(request, `Add result failed (${res.status}): ${text}`);
  }

  return NextResponse.redirect(new URL("/admin?message=Result+saved", request.url));
}
