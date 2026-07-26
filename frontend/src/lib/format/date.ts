import { format } from "date-fns";

export function formatDateTime(date: Date): string {
  return format(date, "MMM d, h:mm a");
}

/** Zero-padded UTC hour label for chart axes, e.g. 0 -> "00". */
export function formatHourLabel(hour: number): string {
  return hour.toString().padStart(2, "0");
}

/** Short UTC date label for chart axes/filters, e.g. "2026-03-11" -> "Mar 11". */
export function formatDayLabel(day: string): string {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
