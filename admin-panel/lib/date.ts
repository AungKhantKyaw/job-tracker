// lib/date.ts
// Helpers for rendering date-only values that come back from the API.
//
// The backend stores date-only fields (appliedDate, followupDate) as UTC
// midnight — "2026-10-22" becomes "2026-10-22T00:00:00.000Z". Parsing that
// with `new Date(...)` and formatting it in local time renders the previous
// calendar day for users in western time zones (UTC-5 and earlier).
//
// To avoid that, read the Y/M/D components and build a local Date from them.
// The rendered date then always matches the calendar date the user picked,
// in every time zone.

/**
 * Format a date-only value (e.g. "2026-10-22T00:00:00.000Z") as a local
 * calendar date, without shifting it by a day.
 *
 * Returns an empty string for missing or invalid values.
 *
 * @param value   The raw value from the API.
 * @param locale  Optional locale, as per `Date.prototype.toLocaleDateString`.
 * @param options Optional options, as per `Date.prototype.toLocaleDateString`.
 */
export function formatDateOnly(
  value: string | null | undefined,
  locale?: string | string[],
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!value) return "";

  // Take the date-only part, e.g. "2026-10-22" from "2026-10-22T00:00:00.000Z"
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value).split("T")[0]);
  if (!match) return "";

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  // Build the date from local components so it is not read as UTC midnight
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return "";

  // Reject values that overflowed (e.g. month 13 or day 45)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "";
  }

  return date.toLocaleDateString(locale, options);
}

/**
 * Parse a date-only value into a sortable "YYYY-MM" month key.
 *
 * Reads the leading Y/M/D components from the string rather than going through
 * `new Date(...)` + local time, so UTC-midnight values do not shift to the
 * previous month in western time zones. Returns an empty string when the value
 * has no usable date part.
 */
export function monthKey(value: string | null | undefined): string {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})/.exec(String(value).split("T")[0]);
  return match ? `${match[1]}-${match[2]}` : "";
}

/**
 * Build the trailing `count` calendar months, oldest first, ending with the
 * month of `now`. Each entry carries a sortable `monthKey` ("2026-01") and a
 * short display `month` label ("Jan").
 */
export function lastMonths(
  count: number,
  now: Date = new Date(),
): { month: string; monthKey: string }[] {
  const months: { month: string; monthKey: string }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    // Day 1 avoids rolling past short months (e.g. the 31st -> next month).
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    months.push({
      month: d.toLocaleDateString("en-US", { month: "short" }),
      monthKey: `${year}-${String(month).padStart(2, "0")}`,
    });
  }
  return months;
}
