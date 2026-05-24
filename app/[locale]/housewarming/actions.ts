"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "../../../db";
import { gifts, reservations } from "../../../drizzle/schema";

export type GiftListItem = {
  id: string;
  titlePl: string;
  titleUk: string;
  descPl: string;
  descUk: string;
  price: string;
  quantity: number | null; // null = unlimited
  shopUrl: string | null;
  altPrice: string | null;
  altShopUrl: string | null;
  reservedCount: number;
  claimers: string[];
};

export async function listGifts(): Promise<GiftListItem[]> {
  const rows = await db
    .select({
      id: gifts.id,
      titlePl: gifts.titlePl,
      titleUk: gifts.titleUk,
      descPl: gifts.descPl,
      descUk: gifts.descUk,
      price: gifts.price,
      quantity: gifts.quantity,
      shopUrl: gifts.shopUrl,
      altPrice: gifts.altPrice,
      altShopUrl: gifts.altShopUrl,
      sortOrder: gifts.sortOrder,
      reservedCount: sql<number>`coalesce(count(${reservations.id}), 0)::int`,
      claimers: sql<string[]>`coalesce(array_agg(${reservations.claimer}) filter (where ${reservations.claimer} is not null), '{}')`,
    })
    .from(gifts)
    .leftJoin(reservations, eq(reservations.giftId, gifts.id))
    .groupBy(gifts.id)
    .orderBy(gifts.sortOrder);

  return rows.map(({ sortOrder: _s, ...rest }) => rest);
}

export type ReserveResult =
  | { ok: true }
  | { ok: false; reason: "full" | "not_found" | "invalid" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Adds one reservation row. Each call is one atomic +1 unit. The transaction
// counts after insert and rolls back if it would exceed `quantity`.
export async function reserveGift(
  giftId: string,
  claimer: string,
): Promise<ReserveResult> {
  const trimmed = claimer.trim();
  if (!UUID_RE.test(trimmed)) return { ok: false, reason: "invalid" };

  try {
    return await db.transaction(async (tx) => {
      const [gift] = await tx
        .select({ quantity: gifts.quantity })
        .from(gifts)
        .where(eq(gifts.id, giftId))
        .limit(1);

      if (!gift) return { ok: false, reason: "not_found" } as const;

      await tx.insert(reservations).values({ giftId, claimer: trimmed });

      if (gift.quantity !== null) {
        const [{ count }] = await tx
          .select({ count: sql<number>`count(*)::int` })
          .from(reservations)
          .where(eq(reservations.giftId, giftId));

        if (count > gift.quantity) {
          throw new ReserveLimitExceeded();
        }
      }

      revalidatePath("/[locale]/housewarming", "page");
      return { ok: true } as const;
    });
  } catch (e) {
    if (e instanceof ReserveLimitExceeded) return { ok: false, reason: "full" };
    throw e;
  }
}

// Removes exactly one reservation row for this gift/claimer. SELECT FOR UPDATE
// LIMIT 1 + DELETE by id makes concurrent − clicks safe — each cancels at most
// the row it locked.
export async function cancelReservation(
  giftId: string,
  claimer: string,
): Promise<{ ok: boolean }> {
  const trimmed = claimer.trim();
  if (!trimmed) return { ok: false };

  const result = await db.transaction(async (tx) => {
    const [row] = await tx
      .select({ id: reservations.id })
      .from(reservations)
      .where(and(eq(reservations.giftId, giftId), eq(reservations.claimer, trimmed)))
      .limit(1)
      .for("update");

    if (!row) return { ok: false };

    await tx.delete(reservations).where(eq(reservations.id, row.id));
    return { ok: true };
  });

  if (result.ok) revalidatePath("/[locale]/housewarming", "page");
  return result;
}

class ReserveLimitExceeded extends Error {}
