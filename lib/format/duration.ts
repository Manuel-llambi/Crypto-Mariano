/**
 * Formats a positive minute count as an hours-and-minutes label (3.6).
 *
 * Callers guarantee `minutes` is a positive integer: a zero total duration is
 * resolved upstream by `deriveProgram`, which returns `durationLabel === null`
 * instead of formatting it (3.5).
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours === 0) return `${remainder} min`;
  if (remainder === 0) return `${hours} h`;
  return `${hours} h ${remainder} min`;
}
