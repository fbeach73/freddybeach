"use client";

import { useState } from "react";
import { BookingCalendar, formatDate, formatTime } from "./booking-calendar";
import { ContactForm } from "./contact-form";

export function BookingSection() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleSlotSelected = (date: string | null, time: string | null) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  const formattedDateTime =
    selectedDate && selectedTime
      ? `${formatDate(selectedDate)} at ${formatTime(selectedTime)}`
      : null;

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
      <BookingCalendar
        onSlotSelected={handleSlotSelected}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
      />
      <ContactForm
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        formattedDateTime={formattedDateTime}
      />
    </div>
  );
}
