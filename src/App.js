import React, { useState, useEffect, useRef } from "react";
import Wasps from "./components";
import ParticleField from "./components/particles/ParticleField";
import backgroundImage from "./components/images/backgrounds/cyberpunk_forest_cityscape.jpg";

const FPS_UPDATE_INTERVAL_MS = 500;
const MEMORY_UPDATE_INTERVAL_MS = 500;

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
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(performance.now());
  const rafIdRef = useRef(null);

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
          fontFamily: "monospace",
          fontSize: 12,
          color: "rgba(180, 180, 180, 0.95)",
          textShadow: "0 1px 2px rgba(0,0,0,0.8)",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        FPS: <span style={{ color: "rgba(255, 255, 255, 0.9)" }}>{fps}</span>
        {" · "}
        Viewport:{" "}
        <span style={{ color: "rgba(255, 255, 255, 0.9)" }}>
          {viewport.width}×{viewport.height}
        </span>
        {memoryMb != null && (
          <>
            {" · "}
            Memory:{" "}
            <span style={{ color: "rgba(255, 255, 255, 0.9)" }}>
              {memoryMb} MB
            </span>
          </>
        )}
      </div>
    </>
  );
}

export default App;
