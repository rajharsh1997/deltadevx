/**
 * Shared UI style utilities for DeltaDevX.
 *
 * Centralising these tokens means any global style change
 * (e.g. tweaking label brightness) requires a single-line edit here,
 * and every component that imports the helper will pick it up automatically.
 */

/**
 * Returns the class string for a section / field label (e.g. "REGEX PATTERN",
 * "JWT TOKEN", "RAW SQL").
 *
 * Usage:
 *   import { sectionLabel } from '../utils/styles'
 *   <label className={sectionLabel(isDark)}>Raw SQL</label>
 */
export const sectionLabel = (isDark: boolean) =>
    `text-[11px] font-mono font-semibold tracking-widest uppercase ${
        isDark ? 'text-[#d1d5db]' : 'text-[#111827]'
    }`
