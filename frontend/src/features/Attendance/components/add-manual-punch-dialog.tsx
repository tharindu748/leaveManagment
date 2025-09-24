import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Save, X, Loader2, CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";

function AddManualPunchDialog({
  open,
  onOpenChange,
  onSaved,
  currentUserId,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onSaved?: () => void;
  currentUserId?: number;
}) {
  const punchSchema = z.object({
    employeeId: z.string().min(1, "Employee ID is required"),
    name: z.string().min(1, "Name is required"),
    direction: z.enum(["IN", "OUT"]),
    note: z.string().optional(),
    date: z.date().refine((val) => !!val, {
      message: "Date is required",
    }),
    time: z
      .string()
      .min(1, "Time is required")
      .regex(/^\d{2}:\d{2}$/, "Time must be HH:MM"),
    source: z.literal("manual"),
  });

  type PunchFormValues = z.infer<typeof punchSchema>;

  const [loadingName, setLoadingName] = useState(false);

  const form = useForm<PunchFormValues>({
    resolver: zodResolver(punchSchema),
    defaultValues: {
      employeeId: "",
      name: "",
      direction: "IN",
      note: "",
      date: new Date(),
      time: new Date().toTimeString().slice(0, 5),
      source: "manual",
    },
  });

  async function fetchEmployeeName(employeeId: string) {
    if (!employeeId) return;
    try {
      setLoadingName(true);
      const res = await api.get(`/users/${encodeURIComponent(employeeId)}`);
      const name = res?.data?.name ?? "";
      form.setValue("name", name, { shouldValidate: true });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch employee name"
      );
      form.setValue("name", "");
    } finally {
      setLoadingName(false);
    }
  }

  function buildEventDateISO(date: Date, time: string) {
    const [h, m] = time.split(":").map(Number);
    const d = new Date(date);
    d.setHours(h ?? 0, m ?? 0, 0, 0);
    return d.toISOString();
  }

  async function onSubmit(values: PunchFormValues) {
    form.clearErrors("root.serverError");
    try {
      const eventTime = buildEventDateISO(values.date, values.time);

      const payload = {
        employeeId: values.employeeId,
        direction: values.direction,
        note: values.note ?? "",
        source: "manual",
        eventTime,
        createdBy: currentUserId,
      };

      await api.post("/punches", payload);

      onSaved?.();
      onOpenChange(false);

      form.reset({
        employeeId: "",
        name: "",
        direction: "IN",
        note: "",
        date: new Date(),
        time: new Date().toTimeString().slice(0, 5),
        source: "manual",
      });
      toast.success("Punch saved successfully");
    } catch (error: any) {
      console.error(error);
      form.setError("root.serverError", {
        type: "server",
        message: "Failed to save punch",
      });
      toast.error(error?.response?.data?.message || "Failed to save punch");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          form.reset({
            employeeId: "",
            name: "",
            direction: "IN",
            note: "",
            date: new Date(),
            time: new Date().toTimeString().slice(0, 5),
            source: "manual",
          });
        }
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-2xl [&>button]:hidden p-6 overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle>Add Manual Punch</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="gap-2"
                type="button"
              >
                <X className="h-4 w-4" />
                Close
              </Button>
              <Button
                className="gap-2 bg-black text-white"
                type="submit"
                form="punch-form"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4">
          <Form {...form}>
            <form
              id="punch-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Employee ID"
                          type="text"
                          {...field}
                          onBlur={(e) => {
                            field.onBlur();
                            fetchEmployeeName(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Name
                        {loadingName && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          readOnly
                          {...field}
                          placeholder="Auto-filled from Employee ID"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="direction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Direction</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(v) =>
                            field.onChange(v as "IN" | "OUT")
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select direction" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IN">IN</SelectItem>
                            <SelectItem value="OUT">OUT</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="source"
                  render={() => (
                    <FormItem>
                      <FormLabel>Source</FormLabel>
                      <FormControl>
                        <Input value="manual" readOnly />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(d) => field.onChange(d ?? new Date())}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input type="time" step={60} {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Type the note here" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.formState.errors.root?.serverError && (
                <div className="text-center text-xs text-destructive">
                  {form.formState.errors.root.serverError.message}
                </div>
              )}
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddManualPunchDialog;
