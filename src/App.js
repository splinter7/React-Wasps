import React, { useState, useEffect, useRef } from "react";
import Wasps from "./components";
import ParticleField from "./components/particles/ParticleField";
import AudioPlayer from "./components/audio/AudioPlayer";
import { THUNDER_FLICKER_EVENT } from "./components/audio/thunderFlicker";
import backgroundImage from "./components/images/backgrounds/cyberpunk_forest_cityscape.jpg";
import {
  BackgroundLayer,
  FlickerOverlay,
  ContentWrapper,
  StatsBar,
  AudioWrapper,
  StatsDivider,
  StatsText,
  StatsValue,
} from "./App.style";

const FPS_UPDATE_INTERVAL_MS = 500;
const MEMORY_UPDATE_INTERVAL_MS = 500;
const FLICKER_DECAY = 0.88;

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
      : { width: 0, height: 0 }
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
        Math.min(1, raw)
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
      <BackgroundLayer
        $backgroundImage={backgroundImage}
        $flickerIntensity={flickerIntensity}
      />
      <FlickerOverlay $flickerIntensity={flickerIntensity} aria-hidden="true" />
      <ParticleField />
      <ContentWrapper>
        <Wasps />
      </ContentWrapper>
      <StatsBar>
        <AudioWrapper>
          <AudioPlayer embedded />
        </AudioWrapper>
        <StatsDivider />
        <StatsText>
          FPS <StatsValue>{fps}</StatsValue>
          {" · "}
          {viewport.width}×{viewport.height}
          {memoryMb != null && (
            <>
              {" · "}
              <StatsValue>{memoryMb} MB</StatsValue>
            </>
          )}
        </StatsText>
      </StatsBar>
    </>
  );
}

export default App;
