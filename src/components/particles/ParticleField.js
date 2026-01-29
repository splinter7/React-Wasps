import React, { useRef, useEffect } from "react";
import { createParticleAnimation } from "./particleAnimation";

function ParticleField({ options } = {}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const animation = createParticleAnimation(canvas, options);
    animationRef.current = animation;
    animation.resize(window.innerWidth, window.innerHeight);
    animation.start();

    const handleResize = () => {
      animation.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      animation.stop();
      animationRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 2,
      }}
      aria-hidden="true"
    />
  );
}

export default ParticleField;
