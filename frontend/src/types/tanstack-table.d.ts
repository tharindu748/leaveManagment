import { type Column } from "@tanstack/react-table";
import type React from "react";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    filterComponent?: React.FC<{
      column: Column<TData, TValue>;
      placeholder?: string;
    }>;
    filterPlaceholder?: string;
  }

  interface TableMeta<TData> {
    setDialogOpen?: (open: boolean) => void;
    setReportToEdit?: (report: TData | null) => void;
    prefetchReport?: (id: string) => void | Promise<void>;
    prefetchLanguages?: () => void | Promise<void>;
  }
}
