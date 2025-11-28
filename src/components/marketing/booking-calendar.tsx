"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getAvailableSlots,
  formatTime,
  formatDate,
  type DaySlots,
} from "@/lib/data/booking-slots";
import { cn } from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";

interface BookingCalendarProps {
  onSlotSelected?: (date: string | null, time: string | null) => void;
  selectedDate?: string | null;
  selectedTime?: string | null;
  className?: string;
}

export function BookingCalendar({
  onSlotSelected,
  selectedDate: controlledDate,
  selectedTime: controlledTime,
  className,
}: BookingCalendarProps) {
  // Support both controlled and uncontrolled modes
  const [internalDate, setInternalDate] = useState<string | null>(null);
  const [internalTime, setInternalTime] = useState<string | null>(null);

  const selectedDate = controlledDate !== undefined ? controlledDate : internalDate;
  const selectedTime = controlledTime !== undefined ? controlledTime : internalTime;

  const availableSlots: DaySlots[] = getAvailableSlots();

  const selectedDaySlots = selectedDate
    ? availableSlots.find((d) => d.date === selectedDate)?.slots ?? []
    : [];

  const handleDateSelect = (date: string) => {
    setInternalDate(date);
    setInternalTime(null);
    onSlotSelected?.(date, null);
  };

  const handleTimeSelect = (time: string) => {
    setInternalTime(time);
    if (selectedDate) {
      onSlotSelected?.(selectedDate, time);
    }
  };

  return (
    <>
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select a Date & Time
          </CardTitle>
          <CardDescription>
            Choose your preferred consultation slot. All times are in Atlantic
            Time (AT).
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Date Selection Grid */}
          <div>
            <h4 className="mb-3 text-sm font-medium">Available Dates</h4>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {availableSlots.map((day) => {
                const availableCount = day.slots.filter(
                  (s) => s.isAvailable
                ).length;
                const isSelected = selectedDate === day.date;

                return (
                  <Button
                    key={day.date}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "h-auto flex-col items-start p-3",
                      availableCount === 0 && "opacity-50"
                    )}
                    onClick={() => handleDateSelect(day.date)}
                    disabled={availableCount === 0}
                  >
                    <span className="text-xs font-normal opacity-70">
                      {formatDate(day.date).split(",")[0]}
                    </span>
                    <span className="text-sm font-semibold">
                      {formatDate(day.date).split(", ")[1]}
                    </span>
                    <span
                      className={cn(
                        "mt-1 text-xs",
                        isSelected
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      )}
                    >
                      {availableCount} slots
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Time Slot Selection */}
          {selectedDate && (
            <div>
              <h4 className="mb-3 text-sm font-medium">
                Available Times for {formatDate(selectedDate)}
              </h4>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {selectedDaySlots.map((slot) => {
                  const isSelected = selectedTime === slot.time;

                  return (
                    <Button
                      key={slot.time}
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "justify-start gap-2",
                        !slot.isAvailable && "opacity-50"
                      )}
                      onClick={() => handleTimeSelect(slot.time)}
                      disabled={!slot.isAvailable}
                    >
                      <Clock className="h-4 w-4" />
                      {formatTime(slot.time)}
                      {!slot.isAvailable && (
                        <span className="ml-auto text-xs">Booked</span>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selection Summary */}
          {selectedDate && selectedTime && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Selected: {formatDate(selectedDate)} at {formatTime(selectedTime)}
              </p>
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                Fill out the form to complete your booking
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

// Export formatting helpers for use in other components
export { formatDate, formatTime };
