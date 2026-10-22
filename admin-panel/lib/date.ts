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
