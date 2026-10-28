/**
 * Safely extract a human-readable message from an unknown error value.
 * Handles Error objects, plain strings, and any other thrown value.
 */
export const errorMessage = (e: unknown): string => {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  if (e != null) return String(e);
  return "unknown error";
};