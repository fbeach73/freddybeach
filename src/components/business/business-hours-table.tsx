"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatHours } from "@/lib/utils/business";
import type { BusinessHours, DayOfWeek } from "@/lib/types";

interface BusinessHoursTableProps {
  hours: BusinessHours[];
  className?: string;
}

const dayOrder: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const dayLabels: Record<DayOfWeek, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

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

export function BusinessHoursTable({ hours, className }: BusinessHoursTableProps) {
  const currentDay = getCurrentDay();
  const sortedHours = dayOrder.map((day) =>
    hours.find((h) => h.day === day)
  ).filter((h): h is BusinessHours => h !== undefined);

  return (
    <div className={cn("nb-card bg-card", className)}>
      <div className="h-2 bg-nb-yellow border-b-2 border-nb-border" />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center bg-nb-yellow border-2 border-nb-border">
            <Clock className="h-4 w-4 text-black" />
          </div>
          <h3 className="text-lg font-bold uppercase tracking-tight">Business Hours</h3>
        </div>
        <div className="border-b-2 border-nb-border/10 mb-3" />
        <div className="space-y-1">
          {sortedHours.map((dayHours) => {
            const isToday = dayHours.day === currentDay;
            return (
              <div
                key={dayHours.day}
                className={cn(
                  "flex justify-between items-center py-2 px-3",
                  isToday && "bg-nb-yellow/20 border-2 border-nb-border font-bold"
                )}
              >
                <span className={cn("text-sm", isToday && "font-bold")}>
                  {dayLabels[dayHours.day]}
                  {isToday && (
                    <span className="ml-2 text-xs font-bold uppercase text-nb-border/60">
                      Today
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    dayHours.closed
                      ? "text-muted-foreground"
                      : isToday
                      ? "font-bold"
                      : "text-foreground"
                  )}
                >
                  {formatHours(dayHours)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
