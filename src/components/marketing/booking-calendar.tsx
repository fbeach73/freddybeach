"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getAvailableSlots,
  formatTime,
  formatDate,
  type DaySlots,
} from "@/lib/data/booking-slots";
import { cn } from "@/lib/utils";
import { Calendar, Check, Clock } from "lucide-react";

interface BookingCalendarProps {
  onSlotSelected?: (date: string, time: string) => void;
  className?: string;
}

export function BookingCalendar({
  onSlotSelected,
  className,
}: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const availableSlots: DaySlots[] = getAvailableSlots();

  const selectedDaySlots = selectedDate
    ? availableSlots.find((d) => d.date === selectedDate)?.slots ?? []
    : [];

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleBooking = () => {
    if (selectedDate && selectedTime) {
      onSlotSelected?.(selectedDate, selectedTime);
      setShowSuccessDialog(true);
    }
  };

  const handleDialogClose = () => {
    setShowSuccessDialog(false);
    setSelectedDate(null);
    setSelectedTime(null);
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

          {/* Book Button */}
          {selectedDate && selectedTime && (
            <div className="border-t pt-4">
              <div className="mb-4 rounded-lg bg-muted p-3">
                <p className="text-sm font-medium">Your Selection</p>
                <p className="text-muted-foreground">
                  {formatDate(selectedDate)} at {formatTime(selectedTime)}
                </p>
              </div>
              <Button onClick={handleBooking} className="w-full" size="lg">
                Book This Time
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-center">Booking Confirmed!</DialogTitle>
            <DialogDescription className="text-center">
              Your consultation has been scheduled for{" "}
              <strong>
                {selectedDate && formatDate(selectedDate)} at{" "}
                {selectedTime && formatTime(selectedTime)}
              </strong>
              . You&apos;ll receive a confirmation email shortly with details on how
              to prepare for your session.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={handleDialogClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
