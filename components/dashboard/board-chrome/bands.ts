/**
 * Subtle dark-palette section bands for dashboard views.
 * WaveDivider fill must equal the band BELOW so the crest is a real seam.
 */
export const DASH_BAND = {
  /** Deepest - headers / lead metrics */
  ink: "color-mix(in srgb, #05080f 45%, var(--canvas))",
  /** Mid slate - ops / supporting blocks */
  slate: "color-mix(in srgb, var(--surface) 48%, var(--canvas))",
  /** Cool wash - closing sections (accent UI unchanged) */
  mist: "color-mix(in srgb, var(--accent-subtle) 24%, var(--canvas))",
} as const;
