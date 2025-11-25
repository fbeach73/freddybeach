import type { Business, BusinessHours, DayOfWeek } from "@/lib/types";

/**
 * Generate a placeholder image URL using Picsum
 */
export function getBusinessImage(
  seed: string,
  width: number = 800,
  height: number = 600
): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

/**
 * Get the current day of week
 */
function getCurrentDay(): DayOfWeek {
  const days: DayOfWeek[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[new Date().getDay()];
}

/**
 * Parse a time string (HH:MM) to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Check if a business is currently open
 */
export function isOpenNow(hours: BusinessHours[]): boolean {
  const currentDay = getCurrentDay();
  const todayHours = hours.find((h) => h.day === currentDay);

  if (!todayHours || todayHours.closed) {
    return false;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = timeToMinutes(todayHours.open);
  const closeMinutes = timeToMinutes(todayHours.close);

  // Handle 24-hour businesses (open: 00:00, close: 23:59)
  if (openMinutes === 0 && closeMinutes === 1439) {
    return true;
  }

  // Handle businesses that close after midnight
  if (closeMinutes < openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

/**
 * Get today's hours for a business
 */
export function getTodayHours(hours: BusinessHours[]): BusinessHours | undefined {
  const currentDay = getCurrentDay();
  return hours.find((h) => h.day === currentDay);
}

/**
 * Format business hours for display
 */
export function formatHours(hours: BusinessHours): string {
  if (hours.closed) {
    return "Closed";
  }

  // Handle 24-hour businesses
  if (hours.open === "00:00" && (hours.close === "23:59" || hours.close === "24:00")) {
    return "Open 24 hours";
  }

  return `${formatTime(hours.open)} - ${formatTime(hours.close)}`;
}

/**
 * Format time from 24h to 12h format
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Get the next opening time for a business
 */
export function getNextOpenTime(hours: BusinessHours[]): string | null {
  if (isOpenNow(hours)) {
    return null;
  }

  const days: DayOfWeek[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const currentDayIndex = new Date().getDay();
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Check today first (if we haven't opened yet)
  const todayHours = hours.find((h) => h.day === days[currentDayIndex]);
  if (todayHours && !todayHours.closed) {
    const openMinutes = timeToMinutes(todayHours.open);
    if (currentMinutes < openMinutes) {
      return `Opens at ${formatTime(todayHours.open)}`;
    }
  }

  // Check subsequent days
  for (let i = 1; i <= 7; i++) {
    const checkDayIndex = (currentDayIndex + i) % 7;
    const checkDay = days[checkDayIndex];
    const checkHours = hours.find((h) => h.day === checkDay);

    if (checkHours && !checkHours.closed) {
      const dayName = i === 1 ? "tomorrow" : capitalizeFirst(checkDay);
      return `Opens ${dayName} at ${formatTime(checkHours.open)}`;
    }
  }

  return null;
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get average rating display (e.g., "4.5" or "4.8")
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * Get full address string
 */
export function getFullAddress(business: Business): string {
  return `${business.address}, ${business.city}, ${business.province} ${business.postalCode}`;
}

/**
 * Get Google Maps URL for a business
 */
export function getGoogleMapsUrl(business: Business): string {
  const address = encodeURIComponent(getFullAddress(business));
  return `https://www.google.com/maps/search/?api=1&query=${address}`;
}

/**
 * Get phone URL for click-to-call
 */
export function getPhoneUrl(phone: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, "");
  return `tel:${cleaned}`;
}

/**
 * Sort businesses by rating
 */
export function sortByRating(businesses: Business[], descending = true): Business[] {
  return [...businesses].sort((a, b) =>
    descending ? b.rating - a.rating : a.rating - b.rating
  );
}

/**
 * Sort businesses by name
 */
export function sortByName(businesses: Business[], descending = false): Business[] {
  return [...businesses].sort((a, b) =>
    descending ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)
  );
}

/**
 * Filter businesses that are currently open
 */
export function filterOpenNow(businesses: Business[]): Business[] {
  return businesses.filter((b) => isOpenNow(b.hours));
}

/**
 * Filter businesses by minimum rating
 */
export function filterByMinRating(businesses: Business[], minRating: number): Business[] {
  return businesses.filter((b) => b.rating >= minRating);
}

/**
 * Filter businesses by tier
 */
export function filterByTier(
  businesses: Business[],
  tier: "free" | "enhanced" | "featured"
): Business[] {
  return businesses.filter((b) => b.tier === tier);
}
