"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Business Hours</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedHours.map((dayHours) => {
            const isToday = dayHours.day === currentDay;
            return (
              <div
                key={dayHours.day}
                className={cn(
                  "flex justify-between items-center py-2 px-3 rounded-md",
                  isToday && "bg-primary/10 font-medium"
                )}
              >
                <span className={cn(isToday && "text-primary")}>
                  {dayLabels[dayHours.day]}
                  {isToday && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      (Today)
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    dayHours.closed
                      ? "text-muted-foreground"
                      : isToday
                      ? "text-primary"
                      : "text-foreground"
                  )}
                >
                  {formatHours(dayHours)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
