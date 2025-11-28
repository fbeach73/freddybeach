// Reading Time Calculator

import readingTime from "reading-time";

/**
 * Calculate reading time for content
 * Returns the number of minutes to read
 */
export function calculateReadingTime(content: string): number {
  const result = readingTime(content);
  return Math.ceil(result.minutes);
}

/**
 * Format reading time for display
 * e.g., "5 min read"
 */
export function formatReadingTime(minutes: number): string {
  if (minutes <= 1) {
    return "1 min read";
  }
  return `${minutes} min read`;
}

/**
 * Calculate and format reading time in one call
 */
export function getReadingTimeText(content: string): string {
  const minutes = calculateReadingTime(content);
  return formatReadingTime(minutes);
}
