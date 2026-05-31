"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type * as React from "react";
import { DayPicker } from "react-day-picker";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: "flex flex-col items-center",
        month_caption:
          "flex justify-center items-center w-full mb-4 text-xl font-semibold text-center",

        month_grid: "w-full border-collapse space-y-1",
        week: "flex w-full justify-between",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
        row: "flex w-full mt-2 justify-between",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md"
            : "[&:has([aria-selected])]:rounded-md",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
        ),
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-30",
        hidden: "invisible",
        weekday: "flex justify-between w-full", // Updated for proper weekday display
        weekdays: "flex justify-between w-full", // Align the weekday names
        nav: "flex items-center justify-center w-full order-2 mt-2",
        button_next: "mr-2",
        button_previous: "ml-2",
        ...classNames,
      }}
      components={{
        PreviousMonthButton: (props) => (
          <button {...props} className={cn("h-6 w-6", props.className)}>
            <ChevronLeft className="h-6 w-6" />
          </button>
        ),
        NextMonthButton: (props) => (
          <button {...props} className={cn("h-6 w-6", props.className)}>
            <ChevronRight className="h-6 w-6" />
          </button>
        ),
        MonthCaption: (props) => (
          <div className="flex justify-center items-center w-full mb-4 text-xl font-semibold text-center">
            {props.children}
          </div>
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
