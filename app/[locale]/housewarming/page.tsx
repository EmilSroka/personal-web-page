import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import GiftList from "./GiftList";
import QueryProvider from "./QueryProvider";
import { listGifts } from "./actions";
import LangSwitch from "./LangSwitch";
import Carousel from "./Carousel";
import styles from "./housewarming.module.css";

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

const PhoneIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>
  </svg>
);

// ── feature items ────────────────────────────────────────────────────────────
const FEATURE_EMOJIS: Record<string, string> = {
  food: "🍽️",
  time: "🕐",
  before: "🧳",
  after: "🎊",
  sleep: "🛌",
};

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

      {/* ── FEATURES: emoji-float list, same width as lede ── */}
      <section className={styles.features}>
        <ul className={styles.featuresList}>
          {(["food", "time", "before", "after", "sleep"] as const).map((id) => (
            <li key={id} className={styles.feature}>
              <span className={styles.featureEmoji} aria-hidden>
                {FEATURE_EMOJIS[id]}
              </span>
              <h3 className={styles.featureTitle}>{t(`Features.${id}.title`)}</h3>
              <p className={styles.featureBody}>{t(`Features.${id}.body`)}</p>
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
              <div className={styles.noteRow}>
                {PhoneIcon}
                <span>{t("Note.phone")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CAROUSEL ── */}
      <Carousel slides={carouselSlides} />

      {/* ── WISH LIST ── */}
      <section className={`${styles.section} ${styles.list}`}>
        <div className={styles.container}>
          <header className={styles.listHead}>
            <p className={styles.kicker}>{t("WishList.kicker")}</p>
            <h2 className={styles.h2}>
              {t("WishList.titlePart1")} <em>{t("WishList.titleAccent")}</em>.
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
