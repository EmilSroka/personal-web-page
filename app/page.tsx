"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.volume = 1;
    v.play()
      .then(() => setNeedsTap(false))
      .catch(() => setNeedsTap(true));
  }, []);

  function start() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.volume = 1;
    v.play().catch(() => {});
    setNeedsTap(false);
  }

  return (
    <div className="fixed inset-0 bg-black">
      <video
        ref={videoRef}
        src="/rick.mp4"
        autoPlay
        loop
        playsInline
        className="w-full h-full object-cover"
      />
      {needsTap && (
        <button
          type="button"
          onClick={start}
          className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer"
          aria-label="Włącz dźwięk"
        >
          <span className="flex items-center gap-3 rounded-full bg-white px-8 py-5 text-base font-semibold text-black shadow-2xl hover:scale-105 transition-transform">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            kliknij — dźwięk się włączy
          </span>
        </button>
      )}
    </div>
  );
}
