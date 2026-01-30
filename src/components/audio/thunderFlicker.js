/**
 * Thunder flicker effect: analyses thunder audio loudness and drives a
 * flicker intensity (0–1) for the background. Exposes setup, loop, and
 * event dispatch for separation of concerns.
 */

export const THUNDER_FLICKER_EVENT = "thunder-flicker";

const TIME_DOMAIN_CENTER = 128;
const RMS_NORMALIZE = 90;
const LOUDNESS_THRESHOLD = 0.1;

/**
 * Dispatches a thunder-flicker custom event with the given intensity (0–1).
 * @param {number} intensity
 */
export function dispatchThunderFlicker(intensity) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(THUNDER_FLICKER_EVENT, { detail: { intensity } }),
  );
}

/**
 * Sets up the thunder analyser graph: routes the thunder element through
 * the given context and returns analyser + time-domain buffer for the loop.
 * @param {AudioContext} ctx
 * @param {HTMLMediaElement} thunderElement
 * @returns {{ analyser: AnalyserNode, dataArray: Uint8Array } | null}
 */
export function setupThunderAnalyser(ctx, thunderElement) {
  if (!ctx || !thunderElement) return null;
  const thunderSource = ctx.createMediaElementSource(thunderElement);
  const thunderAnalyser = ctx.createAnalyser();
  thunderAnalyser.fftSize = 256;
  thunderAnalyser.smoothingTimeConstant = 0.25;
  thunderSource.connect(thunderAnalyser);
  thunderAnalyser.connect(ctx.destination);
  const dataArray = new Uint8Array(thunderAnalyser.fftSize);
  return { analyser: thunderAnalyser, dataArray };
}

/**
 * Computes flicker intensity (0–1) from time-domain waveform data using
 * RMS loudness and a threshold so only the loudest parts trigger.
 * @param {AnalyserNode} analyser
 * @param {Uint8Array} dataArray
 * @returns {number}
 */
function computeLoudnessIntensity(analyser, dataArray) {
  analyser.getByteTimeDomainData(dataArray);
  let sumSq = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const d = dataArray[i] - TIME_DOMAIN_CENTER;
    sumSq += d * d;
  }
  const rms = Math.sqrt(sumSq / dataArray.length);
  const raw = Math.min(1, rms / RMS_NORMALIZE);
  if (raw <= LOUDNESS_THRESHOLD) return 0;
  return Math.min(1, (raw - LOUDNESS_THRESHOLD) / (1 - LOUDNESS_THRESHOLD));
}

/**
 * Starts the thunder flicker loop: each frame reads loudness from the
 * analyser and calls onIntensity(0–1). Returns a stop function.
 * @param {{ analyser: AnalyserNode, dataArray: Uint8Array }} setup
 * @param {(intensity: number) => void} onIntensity
 * @returns {() => void} stop function
 */
export function startThunderFlickerLoop(setup, onIntensity) {
  if (
    !setup?.analyser ||
    !setup?.dataArray ||
    typeof onIntensity !== "function"
  )
    return () => {};

  let rafId = null;

  const update = () => {
    const intensity = computeLoudnessIntensity(setup.analyser, setup.dataArray);
    onIntensity(intensity);
    rafId = requestAnimationFrame(update);
  };
  rafId = requestAnimationFrame(update);

  return () => {
    if (rafId != null) cancelAnimationFrame(rafId);
    onIntensity(0);
  };
}
