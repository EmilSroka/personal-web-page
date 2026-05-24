"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelReservation, listGifts, reserveGift, type GiftListItem } from "./actions";
import styles from "./housewarming.module.css";

const VISITOR_KEY = "housewarming:visitor";
const GIFTS_KEY = ["gifts"];
const POLL_INTERVAL_MS = 5000;

// Image files live at /public/housewarming/wishlist/<id>.<ext>. Most are .jpg;
// the three IDs below were saved as .png (transparent product shots).
const PNG_IDS = new Set([
  "46058ee4-2bdc-4ae9-b821-1789f96c8634", // Miska Tumbled
  "a3dd14af-7189-42e5-b83a-55b18718f5b7", // HOTO AutoCare
  "c1ed7dbf-a69b-42e3-9d38-d1cba74141c0", // Aqara P100
]);
const imageSrc = (id: string) =>
  `/housewarming/wishlist/${id}.${PNG_IDS.has(id) ? "png" : "jpg"}`;

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
  const tWish = useTranslations("WishList");
  const queryClient = useQueryClient();
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setVisitorId(getVisitorId()); }, []);

  // Poll every 5s only while the list is in view AND the tab is visible.
  // Two independent gates feeding one boolean: IntersectionObserver for
  // viewport, document `visibilitychange` for tab focus. Driving
  // `refetchInterval` from JS state means the interval is literally `false`
  // when off — RQ can't poll. `refetchIntervalInBackground: false` stays as
  // belt-and-suspenders for browsers where the events misfire.
  const listRef = useRef<HTMLUListElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isDocVisible, setIsDocVisible] = useState(true);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.01 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setIsDocVisible(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  const shouldPoll = isInView && isDocVisible;

  const { data: gifts } = useQuery({
    queryKey: GIFTS_KEY,
    queryFn: listGifts,
    initialData: initialGifts,
    initialDataUpdatedAt: 0,
    refetchInterval: shouldPoll ? POLL_INTERVAL_MS : false,
    refetchIntervalInBackground: false,
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
          if (type === "reserve") {
            return {
              ...g,
              reservedCount: g.reservedCount + 1,
              claimers: [...g.claimers, visitorId],
            };
          }
          // cancel: drop a single occurrence of my id
          const idx = g.claimers.indexOf(visitorId);
          if (idx === -1) return g;
          const claimers = g.claimers.slice();
          claimers.splice(idx, 1);
          return {
            ...g,
            reservedCount: Math.max(0, g.reservedCount - 1),
            claimers,
          };
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

  const myCountOf = (g: GiftListItem) =>
    visitorId ? g.claimers.filter((c) => c === visitorId).length : 0;
  const isFull = (g: GiftListItem) =>
    g.quantity !== null && g.reservedCount >= g.quantity;

  const title = (g: GiftListItem) => locale === "uk" ? g.titleUk : g.titlePl;
  const desc  = (g: GiftListItem) => locale === "uk" ? g.descUk  : g.descPl;
  const price = (g: GiftListItem) => g.price === "free" ? t("priceFree") : g.price;

  return (
    <>
      <p className={styles.deviceLocalNote}>{tWish("deviceLocalNote")}</p>
      {error && <p className={styles.errorBanner}>{error}</p>}

      <ul ref={listRef} className="list-none p-0 m-0">
        {gifts.map((g) => {
          const mine = myCountOf(g);
          const full = isFull(g);
          const takenByOther = full && mine === 0;

          return (
            <li key={g.id} className={`${styles.giftCard} ${takenByOther ? styles.taken : ""}`}>
              <div className={styles.giftImage}>
                <Image
                  src={imageSrc(g.id)}
                  alt={title(g)}
                  fill
                  sizes="(max-width: 540px) 64px, 96px"
                  style={{ objectFit: "contain" }}
                />
              </div>

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
                    </span>
                  )}
                  {g.shopUrl && (
                    <a href={g.shopUrl} target="_blank" rel="noopener noreferrer" className={styles.shopLink}>
                      {t("shopLink")} ↗
                    </a>
                  )}
                  {g.altShopUrl && g.altPrice && (
                    <a href={g.altShopUrl} target="_blank" rel="noopener noreferrer" className={styles.altLink}>
                      {t("alternative")} • {g.altPrice} ↗
                    </a>
                  )}
                </span>
              </div>

              <div className={styles.giftAction}>
                {mine === 0 ? (
                  <button
                    type="button"
                    className={styles.btn}
                    disabled={takenByOther || !visitorId}
                    onClick={() => mutation.mutate({ type: "reserve", giftId: g.id })}
                  >
                    {takenByOther ? t("taken") : t("claim")}
                  </button>
                ) : (
                  <div className={styles.counter} role="group" aria-label={t("claim")}>
                    <button
                      type="button"
                      className={styles.counterBtn}
                      aria-label={t("removeOne")}
                      disabled={!visitorId}
                      onClick={() => mutation.mutate({ type: "cancel", giftId: g.id })}
                    >
                      −
                    </button>
                    <span className={styles.counterCount} aria-live="polite">{mine}</span>
                    <button
                      type="button"
                      className={styles.counterBtn}
                      aria-label={t("addOne")}
                      disabled={full || !visitorId}
                      onClick={() => mutation.mutate({ type: "reserve", giftId: g.id })}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
