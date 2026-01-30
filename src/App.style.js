import styled from "styled-components";

const FLICKER_BRIGHTNESS_MAX = 0.6;
const FLICKER_MAX_OPACITY = 0.5;

export const BackgroundLayer = styled.div`
  position: fixed;
  inset: 0;
  background-image: url(${(props) => props.$backgroundImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
  filter: brightness(${(props) => 1 + props.$flickerIntensity * FLICKER_BRIGHTNESS_MAX});
  transition: filter 0.06s ease-out;
`;

export const FlickerOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(255, 255, 255, 1);
  opacity: ${(props) => props.$flickerIntensity * FLICKER_MAX_OPACITY};
  pointer-events: none;
  z-index: 1.5;
  transition: opacity 0.04s ease-out;
`;

export const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
`;

export const StatsBar = styled.div`
  position: fixed;
  bottom: 8px;
  left: 8px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-family: monospace;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.88);
  letter-spacing: 0.02em;
  pointer-events: none;
`;

export const AudioWrapper = styled.div`
  pointer-events: auto;
`;

export const StatsDivider = styled.div`
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
`;

export const StatsText = styled.span`
  pointer-events: none;
`;

export const StatsValue = styled.span`
  color: rgba(255, 255, 255, 0.95);
`;
