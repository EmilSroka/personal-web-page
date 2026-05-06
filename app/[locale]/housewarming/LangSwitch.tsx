import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import styles from "./housewarming.module.css";

export default async function LangSwitch() {
  const current = await getLocale();
  const t = await getTranslations("Lang");

  return (
    <nav className={styles.langSwitch} aria-label={t("switchLabel")}>
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href="/housewarming"
          locale={locale}
          className={`${styles.langPill} ${current === locale ? styles.langPillActive : ""}`}
          aria-current={current === locale ? "page" : undefined}
        >
          {t(locale)}
        </Link>
      ))}
    </nav>
  );
}
