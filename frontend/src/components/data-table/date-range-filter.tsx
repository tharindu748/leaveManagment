import type { Column } from "@tanstack/react-table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";

export function DateRangeFilter<T>({ column }: { column: Column<T, unknown> }) {
  const [range, setRange] = useState<DateRange | undefined>();

  useEffect(() => {
    if (range?.from && range?.to) {
      column.setFilterValue({
        from: range.from.toISOString(),
        to: range.to.toISOString(),
      });
    } else if (range?.from) {
      column.setFilterValue({ from: range.from.toISOString() });
    } else {
      column.setFilterValue(undefined);
    }
  }, [range, column]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[260px] justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {range?.from ? (
            range.to ? (
              <>
                {format(range.from, "LLL dd, y")} -{" "}
                {format(range.to, "LLL dd, y")}
              </>
            ) : (
              format(range.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
