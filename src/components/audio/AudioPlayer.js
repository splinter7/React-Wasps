import React, { useState, useRef, useEffect } from "react";
import sampleMp3 from "../../audio/sample.mp3";

const BAR_COUNT = 21;
const BAR_GAP = 2;

const MIN_BAR = 2;
const MAX_BAR = 18;
const PEAK_FALL_DECAY = 0.92;

const rawFileName = sampleMp3.replace(/^.*\//, "").split("?")[0] || "audio";

function formatDisplayFileName(name) {
  if (!name || typeof name !== "string") return "audio";
  let s = name.trim();
  try {
    s = decodeURIComponent(s);
  } catch (_) {}
  s = s.replace(/\.[^.]*$/, ""); // remove extension
  s = s.replace(/\s+/g, " ").trim(); // collapse spaces
  s = s.replace(/[\x00-\x1F\x7F]/g, ""); // strip control chars
  return s || "audio";
}

const displayFileName = formatDisplayFileName(rawFileName);

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const STRIP_MAX_WIDTH = 126; /* 30% smaller than 180 */
const SCROLL_PAUSE_MS = 2000;
const SCROLL_DURATION_MS = 4000;

const stripRowStyle = {
  fontFamily: "monospace",
  fontSize: 10,
  color: "rgba(255, 255, 255, 0.88)",
  letterSpacing: "0.02em",
  display: "flex",
  alignItems: "center",
  maxWidth: STRIP_MAX_WIDTH,
};

const filenameScrollWrapStyle = {
  overflow: "hidden",
  flex: 1,
  minWidth: 0,
};

function AudioPlayer({ embedded = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [barHeights, setBarHeights] = useState(() =>
    Array(BAR_COUNT).fill(MIN_BAR),
  );
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationRef = useRef(null);
  const peakHeightsRef = useRef(Array(BAR_COUNT).fill(MIN_BAR));
  const stripContainerRef = useRef(null);
  const stripTextRef = useRef(null);
  const scrollAnimationRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || typeof window === "undefined" || !window.AudioContext) return;
    if (analyserRef.current) return;

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = ctx;
    const source = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    source.connect(analyser);
    analyser.connect(ctx.destination);
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.75;
    analyserRef.current = analyser;
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

    (async () => {
      try {
        if (ctx.state === "suspended") await ctx.resume();
        await audio.play();
        setIsPlaying(true);
      } catch (_) {
        // Autoplay blocked (e.g. browser policy); user can click play
      }
    })();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onDurationChange = () => setDuration(audio.duration);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", onDurationChange);
    if (audio.duration && Number.isFinite(audio.duration))
      setDuration(audio.duration);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", onDurationChange);
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || !analyserRef.current || !dataArrayRef.current) return;

    const data = dataArrayRef.current;
    const peaks = peakHeightsRef.current;
    const step = Math.floor(data.length / BAR_COUNT);
    const range = MAX_BAR - MIN_BAR;

    const update = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(data);
      for (let i = 0; i < BAR_COUNT; i++) {
        const raw = (data[i * step] ?? 0) / 255;
        const target = MIN_BAR + raw * range;
        const current = peaks[i];
        peaks[i] =
          target >= current
            ? target
            : Math.max(MIN_BAR, current * PEAK_FALL_DECAY);
      }
      setBarHeights(peaks.slice());
      animationRef.current = requestAnimationFrame(update);
    };
    animationRef.current = requestAnimationFrame(update);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    const container = stripContainerRef.current;
    const textEl = stripTextRef.current;
    if (!container || !textEl) return;

    const containerWidth = container.clientWidth;
    const textWidth = textEl.scrollWidth;
    const overflow = textWidth > containerWidth;
    const maxScroll = overflow ? containerWidth - textWidth : 0;

    if (!overflow) {
      textEl.style.transform = "";
      return;
    }

    const startTime = performance.now();
    const cycleDuration = SCROLL_PAUSE_MS * 2 + SCROLL_DURATION_MS * 2;

    const tick = (now) => {
      const elapsed = (now - startTime) % cycleDuration;
      let x = 0;
      if (elapsed < SCROLL_PAUSE_MS) {
        x = 0;
      } else if (elapsed < SCROLL_PAUSE_MS + SCROLL_DURATION_MS) {
        const t = (elapsed - SCROLL_PAUSE_MS) / SCROLL_DURATION_MS;
        x = maxScroll * t;
      } else if (elapsed < SCROLL_PAUSE_MS * 2 + SCROLL_DURATION_MS) {
        x = maxScroll;
      } else {
        const t =
          (elapsed - SCROLL_PAUSE_MS * 2 - SCROLL_DURATION_MS) /
          SCROLL_DURATION_MS;
        x = maxScroll + (0 - maxScroll) * t;
      }
      textEl.style.transform = `translateX(${x}px)`;
      scrollAnimationRef.current = requestAnimationFrame(tick);
    };
    scrollAnimationRef.current = requestAnimationFrame(tick);

    return () => {
      if (scrollAnimationRef.current)
        cancelAnimationFrame(scrollAnimationRef.current);
      textEl.style.transform = "";
    };
  }, []);

  const resetVisualizer = () => {
    const zeroBars = Array(BAR_COUNT).fill(MIN_BAR);
    setBarHeights(zeroBars);
    peakHeightsRef.current = zeroBars.slice();
  };

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      resetVisualizer();
      setIsPlaying(false);
    } else {
      const ctx = audioContextRef.current;
      if (ctx?.state === "suspended") await ctx.resume();
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const countdown = Math.max(0, duration - currentTime);

  const buttonStyle = {
    width: 24,
    height: 24,
    borderRadius: "50%",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    background: embedded ? "transparent" : "rgba(255, 255, 255, 0.95)",
    color: embedded ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.85)",
    fontSize: 10,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const inner = (
    <>
      <audio ref={audioRef} src={sampleMp3} loop />
      <button
        type="button"
        onClick={toggle}
        aria-label={isPlaying ? "Stop" : "Play"}
        style={buttonStyle}
      >
        {isPlaying ? "■" : "▶"}
      </button>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: BAR_GAP,
            height: 20,
          }}
        >
          {barHeights.map((h, i) => (
            <div
              key={i}
              style={{
                width: 4,
                height: h,
                minHeight: MIN_BAR,
                borderRadius: 1,
                background: "rgba(255, 255, 255, 0.75)",
                boxShadow: "0 0 8px rgba(255, 255, 255, 0.5)",
                filter: "blur(0.5px)",
                transition: "height 0.05s ease-out",
              }}
            />
          ))}
        </div>
        <div style={stripRowStyle}>
          <div ref={stripContainerRef} style={filenameScrollWrapStyle}>
            <span
              ref={stripTextRef}
              style={{ display: "inline-block", whiteSpace: "nowrap" }}
            >
              {displayFileName}
            </span>
          </div>
          <span style={{ flexShrink: 0 }}> · {formatTime(countdown)}</span>
        </div>
      </div>
    </>
  );

  if (embedded) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {inner}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 42,
        left: 8,
        zIndex: 3,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 8px",
        background: "rgba(0, 0, 0, 0.5)",
        borderRadius: 6,
        border: "1px solid rgba(255, 255, 255, 0.12)",
        pointerEvents: "auto",
      }}
    >
      {inner}
    </div>
  );
}

export default AudioPlayer;
