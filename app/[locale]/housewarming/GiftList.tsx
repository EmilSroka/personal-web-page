"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelReservation, listGifts, reserveGift, type GiftListItem } from "./actions";
import styles from "./housewarming.module.css";

const VISITOR_KEY = "housewarming:visitor";
const GIFTS_KEY = ["gifts"];

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) { id = generateUUID(); localStorage.setItem(VISITOR_KEY, id); }
  return id;
}

export default function GiftList({
  initialGifts,
  locale,
}: {
  initialGifts: GiftListItem[];
  locale: string;
}) {
  const t = useTranslations("GiftActions");
  const queryClient = useQueryClient();
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setVisitorId(getVisitorId()); }, []);

  const { data: gifts } = useQuery({
    queryKey: GIFTS_KEY,
    queryFn: listGifts,
    initialData: initialGifts,
    initialDataUpdatedAt: 0, // treat server data as immediately stale → refetch on focus
  });

  const mutation = useMutation({
    mutationFn: async ({ type, giftId }: { type: "reserve" | "cancel"; giftId: string }) => {
      if (!visitorId) throw new Error("no visitor");
      if (type === "reserve") {
        const result = await reserveGift(giftId, visitorId);
        if (!result.ok) throw Object.assign(new Error(result.reason), { reason: result.reason });
      } else {
        await cancelReservation(giftId, visitorId);
      }
    },
    onMutate: async ({ type, giftId }) => {
      await queryClient.cancelQueries({ queryKey: GIFTS_KEY });
      const prev = queryClient.getQueryData<GiftListItem[]>(GIFTS_KEY);
      queryClient.setQueryData<GiftListItem[]>(GIFTS_KEY, (old = []) =>
        old.map((g) => {
          if (g.id !== giftId || !visitorId) return g;
          if (type === "reserve") return { ...g, reservedCount: g.reservedCount + 1, claimers: [...g.claimers, visitorId] };
          return { ...g, reservedCount: Math.max(0, g.reservedCount - 1), claimers: g.claimers.filter((c) => c !== visitorId) };
        }),
      );
      return { prev };
    },
    onError: (err: Error & { reason?: string }, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(GIFTS_KEY, ctx.prev);
      setError(err.reason === "full" ? t("errorFull") : t("errorGeneric"));
      setTimeout(() => setError(null), 4000);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: GIFTS_KEY }),
  });

  const isMine = (g: GiftListItem) => !!visitorId && g.claimers.includes(visitorId);
  const isFull = (g: GiftListItem) => g.quantity !== null && g.reservedCount >= g.quantity;

  const title = (g: GiftListItem) => locale === "uk" ? g.titleUk : g.titlePl;
  const desc  = (g: GiftListItem) => locale === "uk" ? g.descUk  : g.descPl;
  const price = (g: GiftListItem) => g.price === "free" ? t("priceFree") : g.price;

  return (
    <>
      {error && <p className={styles.errorBanner}>{error}</p>}

      <ul className="list-none p-0 m-0">
        {gifts.map((g) => {
          const mine = isMine(g);
          const full = isFull(g);
          const takenByOther = full && !mine;

          return (
            <li key={g.id} className={`${styles.giftCard} ${takenByOther ? styles.taken : ""}`}>
              <div className={styles.giftBody}>
                <span className={styles.giftTitle}>{title(g)}</span>
                <span className={styles.giftMeta}>
                  <span className={styles.giftDesc}>{desc(g)}</span>
                  <span className={styles.giftPrice}>{price(g)}</span>
                </span>

                <span className={styles.giftFooter}>
                  {g.quantity === null ? (
                    <span className={styles.giftSlots}>{t("unlimited")}</span>
                  ) : (
                    <span className={styles.giftSlots}>
                      {t("slots", { reserved: g.reservedCount, total: g.quantity })}
                      {mine && <> · <strong>{t("you")}</strong></>}
                    </span>
                  )}
                  {g.shopUrl && (
                    <a href={g.shopUrl} target="_blank" rel="noopener noreferrer" className={styles.shopLink}>
                      {t("shopLink")} ↗
                    </a>
                  )}
                </span>
              </div>

              <button
                type="button"
                className={`${styles.btn} ${mine ? styles.claimed : ""}`}
                disabled={takenByOther || mutation.isPending || !visitorId}
                onClick={() =>
                  mutation.mutate({ type: mine ? "cancel" : "reserve", giftId: g.id })
                }
              >
                {takenByOther ? t("taken") : mine ? t("cancel") : t("claim")}
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
