"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import styles from "./housewarming.module.css";

export type Slide = {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  caption: string;
  placeholder?: string;
};

export default function Carousel({ slides }: { slides: Slide[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selected, setSelected] = useState(0);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  // Set viewport height to the current slide's figure height (not the stretched slide wrapper)
  const syncHeight = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    const slideNode = emblaApi.slideNodes()[index];
    const viewport = viewportRef.current;
    if (!slideNode || !viewport) return;
    const figure = slideNode.querySelector("figure") as HTMLElement | null;
    const h = (figure ?? slideNode).offsetHeight;
    if (h > 0) viewport.style.height = h + "px";
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => { setSelected(emblaApi.selectedScrollSnap()); syncHeight(); };
    syncHeight();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", syncHeight);
    window.addEventListener("resize", syncHeight);
    // Re-sync once images finish loading
    const imgs = viewportRef.current?.querySelectorAll("img") ?? [];
    imgs.forEach((img) => img.addEventListener("load", syncHeight));
    return () => {
      window.removeEventListener("resize", syncHeight);
      imgs.forEach((img) => img.removeEventListener("load", syncHeight));
    };
  }, [emblaApi, syncHeight]);

  // Callback ref: store the node in both emblaRef and viewportRef
  const setRefs = useCallback((node: HTMLDivElement | null) => {
    viewportRef.current = node;
    if (typeof emblaRef === "function") emblaRef(node);
    else if (emblaRef && "current" in emblaRef) (emblaRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  }, [emblaRef]);

  return (
    <div className={styles.carousel}>
      <div className={styles.carouselMask}>
        <div className={styles.emblaViewport} ref={setRefs}>
          <div className={styles.emblaContainer}>
            {slides.map((slide, i) => (
              <div className={styles.emblaSlide} key={i}>
                <figure className={styles.slideInner}>
                  {slide.src ? (
                    <Image
                      src={slide.src}
                      alt={slide.alt ?? ""}
                      width={slide.width ?? 2000}
                      height={slide.height ?? 2000}
                      sizes="100vw"
                      className={styles.slideImg}
                    />
                  ) : (
                    <div className={styles.slidePh}>
                      <span>{slide.placeholder ?? `zdjęcie ${i + 1}`}</span>
                    </div>
                  )}
                  <figcaption className={styles.slideCaption}>
                    {slide.caption}
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            className={`${styles.carouselBtn} ${styles.carouselBtnPrev}`}
            aria-label="Poprzedni slajd"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={scrollNext}
            className={`${styles.carouselBtnNext} ${styles.carouselBtn}`}
            aria-label="Następny slajd"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          <div className={styles.dots}>
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                className={`${styles.dot} ${i === selected ? styles.dotActive : ""}`}
                aria-label={`Slajd ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
