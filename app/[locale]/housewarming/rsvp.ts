"use server";

import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { rsvps } from "../../../drizzle/schema";

export type RsvpChoice = "main" | "alt" | "both" | "no";

const VALID_CHOICES: ReadonlySet<RsvpChoice> = new Set(["main", "alt", "both", "no"]);
const MAX_NAME_LEN = 200;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type SubmitResult = { ok: true } | { ok: false; reason: "invalid" | "error" };

// Upsert keyed by visitor_id. Same device = same row, so re-submitting just
// updates name/choice rather than creating duplicates.
export async function submitRsvp(
  visitorId: string,
  name: string,
  choice: RsvpChoice,
): Promise<SubmitResult> {
  const trimmed = name.trim();
  if (!UUID_RE.test(visitorId)) return { ok: false, reason: "invalid" };
  if (!trimmed || trimmed.length > MAX_NAME_LEN) return { ok: false, reason: "invalid" };
  if (!VALID_CHOICES.has(choice)) return { ok: false, reason: "invalid" };

  try {
    await db
      .insert(rsvps)
      .values({ visitorId, name: trimmed, choice })
      .onConflictDoUpdate({
        target: rsvps.visitorId,
        set: { name: trimmed, choice },
      });
    return { ok: true };
  } catch (e) {
    console.error("[submitRsvp] insert failed", { visitorId, choice }, e);
    return { ok: false, reason: "error" };
  }
}

// Pre-fill data for a returning visitor. Null when no prior RSVP exists, or
// on any DB error (e.g. migration 0006 not yet applied) — the form just
// renders empty in that case instead of crashing the page.
export async function getMyRsvp(
  visitorId: string,
): Promise<{ name: string; choice: RsvpChoice } | null> {
  if (!UUID_RE.test(visitorId)) return null;
  try {
    const [row] = await db
      .select({ name: rsvps.name, choice: rsvps.choice })
      .from(rsvps)
      .where(eq(rsvps.visitorId, visitorId))
      .limit(1);
    return row ? { name: row.name, choice: row.choice as RsvpChoice } : null;
  } catch (e) {
    console.error("[getMyRsvp] select failed", { visitorId }, e);
    return null;
  }
}
