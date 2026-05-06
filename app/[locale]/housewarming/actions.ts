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
  | { ok: false; reason: "full" | "duplicate" | "not_found" | "invalid" };

export async function reserveGift(
  giftId: string,
  claimer: string,
): Promise<ReserveResult> {
  const trimmed = claimer.trim();
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRe.test(trimmed)) return { ok: false, reason: "invalid" };

  try {
    const result = await db.transaction(async (tx) => {
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
          // Roll back: too late, gift just filled up.
          throw new ReserveLimitExceeded();
        }
      }

      return { ok: true } as const;
    });
    revalidatePath("/[locale]/housewarming", "page");
    return result;
  } catch (e) {
    if (e instanceof ReserveLimitExceeded) return { ok: false, reason: "full" };
    if (isUniqueViolation(e)) return { ok: false, reason: "duplicate" };
    throw e;
  }
}

export async function cancelReservation(
  giftId: string,
  claimer: string,
): Promise<{ ok: boolean }> {
  const trimmed = claimer.trim();
  if (!trimmed) return { ok: false };

  const deleted = await db
    .delete(reservations)
    .where(and(eq(reservations.giftId, giftId), eq(reservations.claimer, trimmed)))
    .returning({ id: reservations.id });

  if (deleted.length > 0) revalidatePath("/[locale]/housewarming", "page");
  return { ok: deleted.length > 0 };
}

class ReserveLimitExceeded extends Error {}

function isUniqueViolation(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code: string }).code === "23505"
  );
}
