// Booking Slots Data for Consultation Page

export interface BookingSlot {
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format (24hr)
  isAvailable: boolean;
}

export interface DaySlots {
  date: string;
  slots: BookingSlot[];
}

// Time slots available each day
const TIME_SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

// Generate mock booking slots for the next 2 weeks
function generateMockSlots(): DaySlots[] {
  const days: DaySlots[] = [];
  const today = new Date();

  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dayOfWeek = date.getDay();
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue;
    }

    const dateStr = date.toISOString().split("T")[0];

    // Create slots with some randomly unavailable for realism
    const slots: BookingSlot[] = TIME_SLOTS.map((time) => {
      // Make approximately 30% of slots unavailable
      const isAvailable = Math.random() > 0.3;
      return {
        date: dateStr,
        time,
        isAvailable,
      };
    });

    days.push({
      date: dateStr,
      slots,
    });
  }

  return days;
}

// Pre-generated slots with deterministic availability for consistent UI
const MOCK_AVAILABILITY: Record<number, number[]> = {
  // Day index -> unavailable time slot indices
  0: [1, 4], // Monday: 10am, 3pm unavailable
  1: [0, 2, 5], // Tuesday: 9am, 11am, 4pm unavailable
  2: [3], // Wednesday: 2pm unavailable
  3: [0, 1, 2], // Thursday: morning slots unavailable
  4: [4, 5], // Friday: afternoon slots unavailable
  5: [2, 3], // Monday: 11am, 2pm unavailable
  6: [0, 5], // Tuesday: 9am, 4pm unavailable
  7: [1, 3, 4], // Wednesday: 10am, 2pm, 3pm unavailable
  8: [2], // Thursday: 11am unavailable
  9: [0, 1, 4, 5], // Friday: busy day
};

function generateDeterministicSlots(): DaySlots[] {
  const days: DaySlots[] = [];
  const today = new Date();
  let dayIndex = 0;

  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dayOfWeek = date.getDay();
    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue;
    }

    const dateStr = date.toISOString().split("T")[0];
    const unavailableSlots = MOCK_AVAILABILITY[dayIndex % 10] || [];

    const slots: BookingSlot[] = TIME_SLOTS.map((time, timeIndex) => ({
      date: dateStr,
      time,
      isAvailable: !unavailableSlots.includes(timeIndex),
    }));

    days.push({
      date: dateStr,
      slots,
    });

    dayIndex++;
  }

  return days;
}

// Export the booking slots
export const bookingSlots = generateDeterministicSlots();

/**
 * Get all available booking slots for the next 2 weeks
 */
export function getAvailableSlots(): DaySlots[] {
  return bookingSlots;
}

/**
 * Check if a specific slot is available
 */
export function isSlotAvailable(date: string, time: string): boolean {
  const day = bookingSlots.find((d) => d.date === date);
  if (!day) return false;

  const slot = day.slots.find((s) => s.time === time);
  return slot?.isAvailable ?? false;
}

/**
 * Get all slots for a specific date
 */
export function getSlotsForDate(date: string): BookingSlot[] {
  const day = bookingSlots.find((d) => d.date === date);
  return day?.slots ?? [];
}

/**
 * Format time for display (e.g., "09:00" -> "9:00 AM")
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Format date for display (e.g., "2024-01-15" -> "Mon, Jan 15")
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00"); // Add time to avoid timezone issues
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
