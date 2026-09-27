/**
 * Pure autosize helpers for the Textarea component.
 * Kept outside the SFC so the clamping logic is directly unit-testable
 * (`<script setup>` cannot export runtime values).
 */

/** Clamp a measured scroll height to the min/max row range. */
export function calcAutosizeHeight(
  scrollHeight: number,
  lineHeight: number,
  minRows?: number,
  maxRows?: number,
): number {
  let height = scrollHeight
  if (minRows !== undefined) height = Math.max(height, minRows * lineHeight)
  if (maxRows !== undefined) height = Math.min(height, maxRows * lineHeight)
  return height
}
