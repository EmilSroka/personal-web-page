"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { getMyRsvp, submitRsvp, type RsvpChoice } from "./rsvp";
import styles from "./housewarming.module.css";

// Same key as GiftList — one visitor identity per browser is used for both gift
// reservations and the RSVP upsert target.
const VISITOR_KEY = "housewarming:visitor";
const CHOICES = ["main", "alt", "both", "no"] as const;

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

export default function RsvpForm() {
  const t = useTranslations("Rsvp");
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [mode, setMode] = useState<"form" | "submitted">("form");
  const [choice, setChoice] = useState<RsvpChoice>("main");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");

  useEffect(() => {
    const id = getVisitorId();
    setVisitorId(id);
    // Pre-fill from any prior RSVP this device sent. If found, start in the
    // "submitted" view — the user can edit via the change-answer button.
    // Swallow network/DB errors so the form still renders.
    getMyRsvp(id).then((rsvp) => {
      if (rsvp) {
        setName(rsvp.name);
        setChoice(rsvp.choice);
        setMode("submitted");
      }
    }).catch(() => { /* show blank form */ });
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || status === "pending" || !visitorId) return;
    setStatus("pending");
    const result = await submitRsvp(visitorId, trimmed, choice);
    if (result.ok) {
      setStatus("idle");
      setMode("submitted");
    } else {
      setStatus("error");
    }
  };

  if (mode === "submitted") {
    return (
      <section className={styles.rsvp} aria-live="polite">
        <p className={styles.rsvpThanks}>
          {choice === "no" ? t("thanksNo") : t("thanks")}
        </p>
        <div className={styles.rsvpThanksActions}>
          <button
            type="button"
            className={styles.rsvpEditBtn}
            onClick={() => setMode("form")}
          >
            {t("changeAnswer")}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.rsvp}>
      <p className={styles.rsvpKicker}>{t("kicker")}</p>
      <h2 className={styles.rsvpTitle}>{t("title")}</h2>
      <p className={styles.rsvpIntro}>{t("intro")}</p>

      <form onSubmit={onSubmit} noValidate>
        <fieldset className={styles.rsvpOptions}>
          <legend className="sr-only">{t("title")}</legend>
          {CHOICES.map((c) => (
            <label
              key={c}
              className={`${styles.rsvpOption} ${choice === c ? styles.rsvpOptionActive : ""}`}
            >
              <input
                type="radio"
                name="rsvp-choice"
                value={c}
                checked={choice === c}
                onChange={() => setChoice(c)}
              />
              <span>{t(`options.${c}`)}</span>
            </label>
          ))}
        </fieldset>

        <div className={styles.rsvpNameRow}>
          <label htmlFor="rsvp-name" className={styles.rsvpNameLabel}>
            {t("nameLabel")}
          </label>
          <input
            id="rsvp-name"
            type="text"
            className={styles.rsvpNameInput}
            placeholder={t("namePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={200}
            required
          />
        </div>

        <div className={styles.rsvpSubmitRow}>
          <button
            type="submit"
            className={styles.rsvpSubmit}
            disabled={status === "pending" || !name.trim() || !visitorId}
          >
            {status === "pending" ? t("submitting") : t("submit")}
          </button>
          {status === "error" && <span className={styles.rsvpError}>{t("error")}</span>}
        </div>
      </form>
    </section>
  );
}
