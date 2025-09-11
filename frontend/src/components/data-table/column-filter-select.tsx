import { type Column } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ColumnFilterSelectProps<TData, TValue> {
  column: Column<TData, TValue>;
  placeholder?: string;
}

export function ColumnFilterSelect<TData, TValue>({
  column,
  placeholder,
}: ColumnFilterSelectProps<TData, TValue>) {
  const uniqueValues = Array.from(
    column.getFacetedUniqueValues().keys()
  ).sort();

  return (
    <Select
      value={(column.getFilterValue() as string) ?? ""}
      onValueChange={(value) =>
        column.setFilterValue(value === "all" ? "" : value)
      }
    >
      <SelectTrigger className="w-48">
        <SelectValue placeholder={placeholder ?? "Select..."} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Select All</SelectItem>
        <SelectSeparator />
        {uniqueValues.map((value) => (
          <SelectItem key={value} value={value}>
            {value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
