"use client";

import { DataTable3 } from "@/components/data-table";
import PageHeaderTitle from "@/components/page-header/title";
import PageHeader from "@/components/page-header/wrapper";
import type { OutletContextType } from "@/layouts/main-layout";
import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router";
import { columns, type Punches } from "../components/Table/columns";
import api from "@/api/axios";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import {
  format,
  addDays,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subDays,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import type { DateRange } from "react-day-picker";
import AddManualPunchDialog from "../components/add-manual-punch-dialog";
import { useAuth } from "@/context/auth-context";

const filterSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  dateRange: z
    .object({
      from: z.date().nullable().optional(),
      to: z.date().nullable().optional(),
    })
    .optional(),
});

export type User = {
  id: string;
  name: string;
  email?: string;
  epfNo?: string;
  nic?: string;
  jobPosition?: string;
  currentUserId: number | undefined;
};

type FilterFormValues = z.infer<typeof filterSchema>;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener?.("change", update);
    return () => mql.removeEventListener?.("change", update);
  }, []);
  return isMobile;
}

function UserPunchesPage() {
  const { user } = useAuth();
  const { setBreadcrumb } = useOutletContext<OutletContextType>();
  const [data, setData] = useState<Punches[]>([]);
  const [open, setOpen] = useState(false);
  const [addPunchToggle, setAddPunchToggle] = useState(false);
  const isMobile = useIsMobile();
  const currentUserId = user?.id;

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      employeeId: "",
      dateRange: undefined,
    },
  });

  const onSubmit = async (values: FilterFormValues) => {
    form.clearErrors("root.serverError");

    try {
      let query = "";
      if (values.dateRange?.from && values.dateRange?.to) {
        query = `?from=${values.dateRange.from.toISOString()}&to=${values.dateRange.to.toISOString()}`;
      } else if (values.dateRange?.from) {
        query = `?date=${values.dateRange.from.toISOString()}`;
      }

      const res = await api.get(`/punches/${values.employeeId}${query}`);
      setData(res.data);
    } catch (err: any) {
      form.setError("root.serverError", {
        type: "server",
        message: "Failed to fetch punches",
      });
    }
  };

  const fetchPunches = async () => {
    try {
      const res = await api.get(`/punches/latest`);
      setData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setBreadcrumb(["Attendance", "User Punches"]);
    // fetchPunches();
  }, []);

  const today = new Date();
  const presets: { label: string; range: DateRange }[] = useMemo(
    () => [
      {
        label: "Today",
        range: { from: startOfDay(today), to: endOfDay(today) },
      },
      {
        label: "Yesterday",
        range: {
          from: startOfDay(subDays(today, 1)),
          to: endOfDay(subDays(today, 1)),
        },
      },
      {
        label: "Last 7 days",
        range: { from: startOfDay(subDays(today, 6)), to: endOfDay(today) },
      },
      {
        label: "This week",
        range: {
          from: startOfWeek(today),
          to: endOfWeek(today),
        },
      },
      {
        label: "This month",
        range: { from: startOfMonth(today), to: endOfMonth(today) },
      },
    ],
    [today]
  );

  const prettyLabel = (range?: DateRange) => {
    if (!range?.from) return "Pick a date or range";
    if (range.from && range.to) {
      return `${format(range.from, "PPP")} – ${format(range.to, "PPP")}`;
    }
    return format(range.from, "PPP");
  };

  const applyAndClose = async () => {
    await onSubmit(form.getValues());
    setOpen(false);
  };

  return (
    <>
      <PageHeader>
        <div>
          <PageHeaderTitle value="User Punches" />
        </div>
      </PageHeader>

      <div className="rounded-lg border p-6">
        <div className="rounded-lg border p-6 mt-3">
          <h2 className="mb-4 font-semibold">Search Punches</h2>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex items-end space-x-4"
            >
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter employee id" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date / Date Range</FormLabel>
                    <FormControl>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full sm:w-[360px] justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <span className="truncate">
                              {prettyLabel(
                                field.value as DateRange | undefined
                              )}
                            </span>
                            {field.value?.from && (
                              <X
                                className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  field.onChange(undefined);
                                }}
                              />
                            )}
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent
                          align="start"
                          sideOffset={8}
                          className="w-[calc(100vw-2rem)] max-w-[720px] p-0"
                        >
                          <div className="flex flex-col sm:flex-row sm:divide-x">
                            {/* Left: Calendar */}
                            <div className="p-3">
                              <Calendar
                                initialFocus
                                mode="range"
                                numberOfMonths={isMobile ? 1 : 2}
                                selected={field.value as DateRange | undefined}
                                onSelect={(range) => {
                                  field.onChange(range);
                                  // auto-close when a full range is set
                                  if (range?.from && range?.to) {
                                    // small delay so the UI updates before closing
                                    setTimeout(() => setOpen(false), 50);
                                  }
                                }}
                                className="rounded-md border"
                                // nicer day states (optional)
                                classNames={{
                                  day_selected:
                                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                  day_today: "font-semibold",
                                  day_outside:
                                    "text-muted-foreground opacity-50",
                                }}
                              />
                            </div>

                            {/* Right: Presets & actions */}
                            <div className="w-full sm:w-[240px] p-3 space-y-3">
                              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Quick presets
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {presets.map((p) => (
                                  <Button
                                    key={p.label}
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                      form.setValue("dateRange", p.range);
                                      // immediately submit and close for faster UX
                                      applyAndClose();
                                    }}
                                  >
                                    {p.label}
                                  </Button>
                                ))}
                              </div>

                              <div className="flex items-center justify-between pt-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    form.setValue("dateRange", undefined)
                                  }
                                >
                                  Clear
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={applyAndClose}
                                  disabled={!form.getValues().dateRange?.from}
                                >
                                  Apply
                                </Button>
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {form.formState.errors.root?.serverError && (
                <div className="text-center text-xs text-destructive">
                  {form.formState.errors.root.serverError.message}
                </div>
              )}

              <Button
                type="submit"
                className=""
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Loading..." : "Search"}
              </Button>

              <Button type="button" onClick={() => setAddPunchToggle(true)}>
                Add Manual Punch
              </Button>
            </form>
          </Form>

          <div className="mt-8">
            <DataTable3 columns={columns} data={data} />
          </div>
        </div>
      </div>
      {addPunchToggle && (
        <AddManualPunchDialog
          open={addPunchToggle}
          onOpenChange={setAddPunchToggle}
          onSaved={fetchPunches}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
}

export default UserPunchesPage;
