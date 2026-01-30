import React, { useState, useEffect, useRef } from "react";
import Wasps from "./components";
import ParticleField from "./components/particles/ParticleField";
import AudioPlayer from "./components/audio/AudioPlayer";
import { THUNDER_FLICKER_EVENT } from "./components/audio/thunderFlicker";
import backgroundImage from "./components/images/backgrounds/cyberpunk_forest_cityscape.jpg";

const FPS_UPDATE_INTERVAL_MS = 500;
const MEMORY_UPDATE_INTERVAL_MS = 500;
const FLICKER_DECAY = 0.88;
const FLICKER_MAX_OPACITY = 0.5;
const FLICKER_BRIGHTNESS_MAX = 0.6;

const hasMemoryAPI = () =>
  typeof performance !== "undefined" && performance.memory;
const getUsedMemoryMb = () =>
  hasMemoryAPI()
    ? (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1)
    : null;

function App() {
  const [fps, setFps] = useState(0);
  const [viewport, setViewport] = useState(() =>
    typeof window !== "undefined"
      ? { width: window.innerWidth, height: window.innerHeight }
      : { width: 0, height: 0 },
  );
  const [memoryMb, setMemoryMb] = useState(null);
  const [flickerIntensity, setFlickerIntensity] = useState(0);
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(performance.now());
  const rafIdRef = useRef(null);
  const flickerDisplayRef = useRef(0);
  const flickerRafRef = useRef(null);
  const lastFlickerIntensityRef = useRef(0);

  useEffect(() => {
    const updateViewport = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const measureFps = () => {
      frameCountRef.current += 1;
      const now = performance.now();
      const elapsed = now - lastFpsUpdateRef.current;
      if (elapsed >= FPS_UPDATE_INTERVAL_MS) {
        setFps(Math.round((frameCountRef.current * 1000) / elapsed));
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }
      rafIdRef.current = requestAnimationFrame(measureFps);
    };
    rafIdRef.current = requestAnimationFrame(measureFps);
    return () => cancelAnimationFrame(rafIdRef.current);
  }, []);

  useEffect(() => {
    if (!hasMemoryAPI()) return;
    const updateMemory = () => setMemoryMb(getUsedMemoryMb());
    updateMemory();
    const id = setInterval(updateMemory, MEMORY_UPDATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onThunderFlicker = (e) => {
      const raw = e.detail?.intensity ?? 0;
      if (raw <= 0) {
        flickerDisplayRef.current = 0;
        return;
      }
      flickerDisplayRef.current = Math.max(
        flickerDisplayRef.current,
        Math.min(1, raw),
      );
    };
    window.addEventListener(THUNDER_FLICKER_EVENT, onThunderFlicker);
    return () =>
      window.removeEventListener(THUNDER_FLICKER_EVENT, onThunderFlicker);
  }, []);

  useEffect(() => {
    const tick = () => {
      const current = flickerDisplayRef.current;
      if (current > 0.005) {
        flickerDisplayRef.current = current * FLICKER_DECAY;
        const next = flickerDisplayRef.current;
        lastFlickerIntensityRef.current = next;
        setFlickerIntensity(next);
      } else {
        flickerDisplayRef.current = 0;
        if (lastFlickerIntensityRef.current !== 0) {
          lastFlickerIntensityRef.current = 0;
          setFlickerIntensity(0);
        }
      }
      flickerRafRef.current = requestAnimationFrame(tick);
    };
    flickerRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (flickerRafRef.current) cancelAnimationFrame(flickerRafRef.current);
    };
  }, []);

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
          filter: `brightness(${1 + flickerIntensity * FLICKER_BRIGHTNESS_MAX})`,
          transition: "filter 0.06s ease-out",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.52)",
          zIndex: 1,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(255, 255, 255, 1)",
          opacity: flickerIntensity * FLICKER_MAX_OPACITY,
          pointerEvents: "none",
          zIndex: 1.5,
          transition: "opacity 0.04s ease-out",
        }}
        aria-hidden="true"
      />
      <ParticleField />
      <div style={{ position: "relative", zIndex: 2 }}>
        <Wasps />
      </div>
      <div
        style={{
          position: "fixed",
          bottom: 8,
          left: 8,
          zIndex: 3,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "6px 10px",
          background: "rgba(0, 0, 0, 0.35)",
          borderRadius: 6,
          border: "1px solid rgba(255, 255, 255, 0.08)",
          fontFamily: "monospace",
          fontSize: 10,
          color: "rgba(255, 255, 255, 0.88)",
          letterSpacing: "0.02em",
          pointerEvents: "none",
        }}
      >
        <div style={{ pointerEvents: "auto" }}>
          <AudioPlayer embedded />
        </div>
        <div
          style={{
            width: 1,
            height: 20,
            background: "rgba(255, 255, 255, 0.2)",
            flexShrink: 0,
          }}
        />
        <span style={{ pointerEvents: "none" }}>
          FPS <span style={{ color: "rgba(255, 255, 255, 0.95)" }}>{fps}</span>
          {" · "}
          {viewport.width}×{viewport.height}
          {memoryMb != null && (
            <>
              {" · "}
              <span style={{ color: "rgba(255, 255, 255, 0.95)" }}>
                {memoryMb} MB
              </span>
            </>
          )}
        </span>
      </div>
    </>
  );
}

export default App;
