/**
 * Spanish month labels indexed by the two-digit month of an ISO `YYYY-MM` date.
 *
 * An explicit table rather than `Date` or `Intl.DateTimeFormat`: parsing
 * "2026-01" as a date lands on midnight UTC, which rolls back to December in
 * negative offsets, and `Intl` month names depend on the runtime's ICU data.
 * The table makes the result independent of the machine running the code.
 */
const MONTH_LABELS: Record<string, string> = {
  "01": "ENERO",
  "02": "FEBRERO",
  "03": "MARZO",
  "04": "ABRIL",
  "05": "MAYO",
  "06": "JUNIO",
  "07": "JULIO",
  "08": "AGOSTO",
  "09": "SEPTIEMBRE",
  "10": "OCTUBRE",
  "11": "NOVIEMBRE",
  "12": "DICIEMBRE",
};

/**
 * Derives the displayed label of an update from its stored ISO date (2.6).
 *
 * Callers guarantee the `YYYY-MM` shape: a malformed date is rejected upstream
 * by the `.regex` of `UpdateSchema`, which is the corresponding row of the
 * error-handling table in design.md.
 */
export function formatMonth(isoMonth: string): string {
  const year = isoMonth.slice(0, 4);
  const month = isoMonth.slice(5, 7);
  const label = MONTH_LABELS[month];

  if (label === undefined) {
    throw new Error(`formatMonth: unknown month in "${isoMonth}"`);
  }

  return `${label} ${year}`;
}
