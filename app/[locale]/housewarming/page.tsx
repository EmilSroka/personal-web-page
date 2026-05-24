export const dynamic = "force-dynamic";

import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import GiftList from "./GiftList";
import QueryProvider from "./QueryProvider";
import { listGifts } from "./actions";
import LangSwitch from "./LangSwitch";
import Carousel from "./Carousel";
import RsvpForm from "./RsvpForm";
import styles from "./housewarming.module.css";

// External links referenced from the numbered Features section. Kept in this
// file because they don't translate — only the surrounding copy does.
const MAP_LINKS = {
  koneser:    "https://maps.app.goo.gl/VXKceVtstobToh7H8",
  zabkowska:  "https://maps.app.goo.gl/KwRuSRrLyXjLJn9LA",
  wodka:      "https://maps.app.goo.gl/B1qgbyHqvmFPWiQu9",
  metro:      "https://maps.app.goo.gl/BzziaurqHzJbYEpo6",
  dworzec:    "https://maps.app.goo.gl/CDFDsvUUDbSsU7k9A",
  markowska:  "https://maps.app.goo.gl/j9cMtK7S8opa7zf26",
  zabPark:    "https://en.parkopedia.pl/parking/carpark/ul_z%C4%85bkowska_8/03/warszawa/",
  radPark:    "https://en.parkopedia.pl/parking/carpark/ul_radzymi%C5%84ska/03/warszawa/",
} as const;

type FeatureKey =
  | "termin" | "before" | "dojazd" | "parking"
  | "start" | "food" | "attractions" | "sleep" | "after";

// "before" and "after" are intentionally omitted — their i18n keys remain in
// messages/{pl,uk}.json so they can be re-added to this list without copy work.
const FEATURES: readonly FeatureKey[] = [
  "termin", "dojazd", "parking",
  "start", "food", "attractions", "sleep",
];

const FEATURE_EMOJIS: Record<FeatureKey, string> = {
  termin:      "📅",
  before:      "🍻",
  dojazd:      "🚇",
  parking:     "🅿️",
  start:       "🕖",
  food:        "🍕",
  attractions: "🃏",
  sleep:       "🛌",
  after:       "🌅",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Hero" });
  return { title: `${t("title")} ${t("titleAccent")}` };
}

// ── inline SVG icons (only used in the sticky note) ─────────────────────────
const PinIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 21s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </svg>
);

const CalendarIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="5" width="18" height="16" rx="2"/>
    <path d="M3 10h18M8 3v4M16 3v4"/>
  </svg>
);

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const gifts = await listGifts();

  const carouselSlides = [
    {
      src: "/housewarming/jamnik.png",
      alt: t("Middle.altJamnik"),
      width: 1448,
      height: 1086,
      caption: t("Middle.captionJamnik"),
    },
    {
      src: "/housewarming/cpn.png",
      alt: t("Middle.altCpn"),
      width: 1306,
      height: 1204,
      caption: t("Middle.captionCpn"),
    },
    {
      src: "/housewarming/anioly.png",
      alt: t("Middle.altAnioly"),
      width: 1402,
      height: 1122,
      caption: t("Middle.captionAnioly"),
    },
  ];

  return (
    <main className={styles.page}>
      <LangSwitch />

      {/* ── HERO ── */}
      <figure className={styles.hero}>
        <Image
          src="/housewarming/koneser.png"
          alt={t("Hero.altKoneser")}
          width={2000}
          height={2000}
          priority
          sizes="100vw"
        />
      </figure>

      {/* ── INTRO: title + lede + features + sticky note ── */}
      <section className={styles.intro}>
        <p className={styles.kickerHi}>{t("Hero.kicker")}</p>
        <h1 className={styles.title}>
          {t("Hero.title")}<br />
          <em>{t("Hero.titleAccent")}</em>.
        </h1>
        <p className={styles.subtitle}>
          {t.rich("Hero.subtitle", {
            date: (chunks) => <b>{chunks}</b>,
          })}
        </p>

        <p className={styles.lede}>{t("Intro.p1")}</p>
        <p className={styles.lede}>{t("Intro.p2")}</p>
        <p className={styles.lede}>{t("Intro.p3")}</p>
      </section>

      {/* ── FEATURES: numbered details ── */}
      <section className={styles.features}>
        <ul className={styles.featuresList}>
          {FEATURES.map((id) => (
            <li key={id} className={styles.feature}>
              <span className={styles.featureEmoji} aria-hidden>{FEATURE_EMOJIS[id]}</span>
              <h3 className={styles.featureTitle}>{t(`Features.${id}.title`)}</h3>
              <p className={styles.featureBody}>
                {t.rich(`Features.${id}.body`, {
                  b:         (chunks) => <b>{chunks}</b>,
                  koneser:   (chunks) => <a href={MAP_LINKS.koneser}   target="_blank" rel="noopener noreferrer">{chunks}</a>,
                  zabkowska: (chunks) => <a href={MAP_LINKS.zabkowska} target="_blank" rel="noopener noreferrer">{chunks}</a>,
                  wodka:     (chunks) => <a href={MAP_LINKS.wodka}     target="_blank" rel="noopener noreferrer">{chunks}</a>,
                  metro:     (chunks) => <a href={MAP_LINKS.metro}     target="_blank" rel="noopener noreferrer">{chunks}</a>,
                  dworzec:   (chunks) => <a href={MAP_LINKS.dworzec}   target="_blank" rel="noopener noreferrer">{chunks}</a>,
                  markowska: (chunks) => <a href={MAP_LINKS.markowska} target="_blank" rel="noopener noreferrer">{chunks}</a>,
                  zabPark:   (chunks) => <a href={MAP_LINKS.zabPark}   target="_blank" rel="noopener noreferrer">{chunks}</a>,
                  radPark:   (chunks) => <a href={MAP_LINKS.radPark}   target="_blank" rel="noopener noreferrer">{chunks}</a>,
                })}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── STICKY NOTE ── */}
      <section className={styles.intro} style={{ paddingTop: 0, paddingBottom: 24 }}>
        <div className={styles.noteWrap}>
          <div className={styles.note} role="note">
            <div className={styles.noteRows}>
              <div className={styles.noteRow}>
                {CalendarIcon}
                <span>
                  <strong>{t("Note.whenStrong")}</strong>
                  {t("Note.whenRest")}
                </span>
              </div>
              <div className={styles.noteRow}>
                {PinIcon}
                <span>
                  <strong>{t("Note.whereStrong")}</strong>
                  {t("Note.whereRest")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RSVP ── */}
      <RsvpForm />

      {/* ── CAROUSEL ── */}
      <Carousel slides={carouselSlides} />

      {/* ── WISH LIST ── */}
      <section className={`${styles.section} ${styles.list}`}>
        <div className={styles.container}>
          <header className={styles.listHead}>
            <p className={styles.kicker}>{t("WishList.kicker")}</p>
            <h2 className={styles.h2}>
              <em>{t("WishList.title")}</em>
            </h2>
            <p className={styles.listIntro}>{t("WishList.intro")}</p>
          </header>
          <QueryProvider>
            <GiftList initialGifts={gifts} locale={locale} />
          </QueryProvider>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <figure className={styles.footer}>
        <Image
          src="/housewarming/brzeska.png"
          alt={t("Hero.altBrzeska")}
          width={2000}
          height={2500}
          sizes="100vw"
        />
      </figure>

      {/* ── SIGN OFF ── */}
      <section className={styles.signoff}>
        <p className={styles.kicker}>{t("Signoff.kicker")}</p>
        <p className={styles.time}>04:00</p>
        <p className={styles.signoffLine}>{t("Signoff.line")}</p>
      </section>
    </main>
  );
}
