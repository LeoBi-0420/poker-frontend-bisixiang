"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Player, Venue } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { pointsForRank } from "@/lib/scoring";

interface Props {
  initialPlayers: Player[];
  initialVenues: Venue[];
}

interface ResultDraft {
  playerId: number | "";
  rank: number | "";
  points: number | "";
  kos: number | "";
  eliminatedBy: number | "";
}

const emptyRow = (): ResultDraft => ({
  playerId: "",
  rank: "",
  points: "",
  kos: "",
  eliminatedBy: "",
});

export function AdminGameShell({ initialPlayers, initialVenues }: Props) {
  const router = useRouter();
  const [gameTitle, setGameTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [venueId, setVenueId] = useState<number | "">(initialVenues[0]?.venue_id ?? "");
  const [buyIn, setBuyIn] = useState("0");
  const [rows, setRows] = useState<ResultDraft[]>([emptyRow()]);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message?: string }>({ type: "idle" });

  const players = useMemo(() => [...initialPlayers].sort((a, b) => a.display_name.localeCompare(b.display_name)), [initialPlayers]);
  const venues = useMemo(() => [...initialVenues].sort((a, b) => a.venue_name.localeCompare(b.venue_name)), [initialVenues]);

  const normalizedRows = useMemo(
    () =>
      rows
        .filter((row) => row.playerId && row.rank)
        .map((row) => ({
          player_id: Number(row.playerId),
          finish_rank: Number(row.rank),
          points: Number(row.points || 0),
          kos: Number(row.kos || 0),
          eliminated_by_player_id: row.eliminatedBy ? Number(row.eliminatedBy) : null,
        }))
        .sort((a, b) => a.finish_rank - b.finish_rank),
    [rows],
  );

  const incompleteRows = useMemo(
    () =>
      rows.filter((row) => {
        const hasAnyValue =
          row.playerId !== "" ||
          row.rank !== "" ||
          row.points !== "" ||
          row.kos !== "" ||
          row.eliminatedBy !== "";

        if (!hasAnyValue) return false;
        return !(row.playerId && row.rank);
      }).length,
    [rows],
  );

  function getMissingRequirements() {
    const missing: string[] = [];
    if (!gameTitle.trim()) missing.push("game title");
    if (!startTime) missing.push("date & time");
    if (!venueId) missing.push("venue");
    if (!normalizedRows.length) missing.push("at least one player result");
    if (incompleteRows > 0) {
      missing.push(
        incompleteRows === 1
          ? "complete the partially filled result row"
          : `complete ${incompleteRows} partially filled result rows`,
      );
    }
    return missing;
  }

  function updateRow(index: number, patch: Partial<ResultDraft>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function updateRank(index: number, nextRank: number | "") {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        return {
          ...row,
          rank: nextRank,
          // Keep admin entry fast: rank selection auto-fills MVP points.
          points: nextRank === "" ? "" : pointsForRank(Number(nextRank)),
        };
      }),
    );
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(index: number) {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function sortRows() {
    setRows((prev) => [...prev].sort((a, b) => {
      const rankA = Number(a.rank) || Number.MAX_SAFE_INTEGER;
      const rankB = Number(b.rank) || Number.MAX_SAFE_INTEGER;
      return rankA - rankB;
    }));
  }

  function resetForm() {
    setGameTitle("");
    setStartTime("");
    setVenueId(initialVenues[0]?.venue_id ?? "");
    setBuyIn("0");
    setRows([emptyRow()]);
    setStatus({ type: "idle" });
  }

  async function handleSubmit() {
    const missing = getMissingRequirements();
    if (missing.length > 0) {
      setStatus({
        type: "error",
        message: `Missing required information: ${missing.join(", ")}.`,
      });
      return;
    }

    setSubmitting(true);
    setStatus({ type: "idle" });

    try {
      const resp = await fetch("/api/admin/games", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          game: {
            game_title: gameTitle,
            start_time: new Date(startTime).toISOString(),
            venue_id: Number(venueId),
            buy_in: Number(buyIn || 0),
          },
          results: normalizedRows,
        }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed (${resp.status})`);
      }

      resetForm();
      router.refresh();
      setStatus({ type: "success", message: "Saved Successfully! Game and results are now live across the site." });
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div style={{ display: "grid", gap: "1rem" }}>
        <div className="card" style={{ background: "var(--surface-alt)" }}>
          <h3 style={{ fontWeight: 700 }}>Step 1 · Game info</h3>
          <p className="admin-form-note">
            <span className="required-indicator">*</span> Required fields. Fields marked <span className="optional-label">(optional)</span> can be left blank.
          </p>
          <div className="form-stack" style={{ marginTop: "0.75rem" }}>
            <div className="form-field">
              <label>
                Title <span className="required-indicator">*</span>
              </label>
              <input value={gameTitle} onChange={(e) => setGameTitle(e.target.value)} placeholder="Urban Pie Sunday" />
            </div>
            <div className="form-field">
              <label>
                Date & time <span className="required-indicator">*</span>
              </label>
              <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="form-field">
              <label>
                Venue <span className="required-indicator">*</span>
              </label>
              <select value={venueId} onChange={(e) => setVenueId(e.target.value ? Number(e.target.value) : "")}>
                <option value="">Select venue</option>
                {venues.map((venue) => (
                  <option key={venue.venue_id} value={venue.venue_id}>
                    {venue.venue_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>
                Buy-in (USD) <span className="optional-label">(optional)</span>
              </label>
              <input type="number" min="0" step="0.01" value={buyIn} onChange={(e) => setBuyIn(e.target.value)} />
            </div>
            <p className="muted" style={{ fontSize: "0.85rem" }}>
              Preview: {gameTitle || "Untitled"} · {venueId ? venues.find((v) => v.venue_id === venueId)?.venue_name : "Venue TBD"} · {formatCurrency(Number(buyIn || 0))}
            </p>
          </div>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
            <h3 style={{ fontWeight: 700 }}>Step 2 · Results table</h3>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="button" className="btn" onClick={sortRows}>
                Sort by rank
              </button>
              <button type="button" className="btn" onClick={addRow}>
                + Add player
              </button>
            </div>
          </div>
          <div style={{ marginTop: "0.75rem", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 0.5rem" }}>
              <thead>
                <tr className="muted" style={{ textAlign: "left", fontSize: "0.85rem" }}>
                  <th>Player *</th>
                  <th>Rank *</th>
                  <th>Points</th>
                  <th>KOs</th>
                  <th>Eliminated by</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <select className="admin-table-input" value={row.playerId} onChange={(e) => updateRow(index, { playerId: e.target.value ? Number(e.target.value) : "" })}>
                        <option value="">Select player</option>
                        {players.map((player) => (
                          <option key={player.player_id} value={player.player_id}>
                            {player.display_name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input className="admin-table-input" type="number" min="1" value={row.rank} onChange={(e) => updateRank(index, e.target.value ? Number(e.target.value) : "")} />
                    </td>
                    <td>
                      <input className="admin-table-input" type="number" value={row.points} onChange={(e) => updateRow(index, { points: e.target.value ? Number(e.target.value) : "" })} />
                    </td>
                    <td>
                      <input className="admin-table-input" type="number" min="0" value={row.kos} onChange={(e) => updateRow(index, { kos: e.target.value ? Number(e.target.value) : "" })} />
                    </td>
                    <td>
                      <select className="admin-table-input" value={row.eliminatedBy} onChange={(e) => updateRow(index, { eliminatedBy: e.target.value ? Number(e.target.value) : "" })}>
                        <option value="">N/A</option>
                        {players.map((player) => (
                          <option key={player.player_id} value={player.player_id}>
                            {player.display_name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button type="button" className="btn" onClick={() => removeRow(index)} disabled={rows.length === 1}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card" style={{ display: "grid", gap: "0.75rem" }}>
        <h3 style={{ fontWeight: 700 }}>Step 3 · Preview & submit</h3>
        <pre style={{ background: "#0b1f2a", color: "#cfe8ff", padding: "0.75rem", borderRadius: "0.8rem", fontSize: "0.85rem", overflowX: "auto" }}>
          {JSON.stringify(
            {
              game_title: gameTitle || "(pending)",
              start_time: startTime || "(pending)",
              venue_id: venueId || "(pending)",
              buy_in: Number(buyIn || 0),
              results: normalizedRows,
            },
            null,
            2,
          )}
        </pre>
        {status.type !== "idle" && (
          <div className={status.type === "error" ? "error-box" : "card"}>
            {status.message}
          </div>
        )}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button type="button" className="btn" onClick={resetForm} disabled={submitting}>
            Reset
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving..." : "Save game & results"}
          </button>
        </div>
      </div>
    </div>
  );
}
