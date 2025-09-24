import type { OutletContextType } from "@/layouts/main-layout";
import { useEffect } from "react";
import { useOutletContext } from "react-router";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import PageHeader from "@/components/page-header/wrapper";
import PageHeaderTitle from "@/components/page-header/title";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import api from "@/api/axios";
import { toast } from "sonner";

function TimeConfigPage() {
  const { setBreadcrumb } = useOutletContext<OutletContextType>();

  const credentialsSchema = z.object({
    workStart: z.string().min(1, "Work start time is required"),
    workEnd: z.string().min(1, "Work end time is required"),
    otEnd: z.string().min(1, "OT end time is required"),
    earlyStart: z.string().min(1, "Early start time is required"),
  });

  type CredentialsFormValues = z.infer<typeof credentialsSchema>;

  const form = useForm<CredentialsFormValues>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      workStart: "",
      workEnd: "",
      otEnd: "",
      earlyStart: "",
    },
  });

  const formatTime = (time: string) => {
    const d = new Date(time);
    const hh = String(d.getUTCHours()).padStart(2, "0"); // Use UTC
    const mm = String(d.getUTCMinutes()).padStart(2, "0"); // Use UTC
    return `${hh}:${mm}`;
  };

  const fetchConfig = async () => {
    try {
      const res = await api.get("/attendance/config");
      const config = res.data;

      form.reset({
        workStart: formatTime(config.workStart),
        workEnd: formatTime(config.workEnd),
        otEnd: formatTime(config.otEnd),
        earlyStart: formatTime(config.earlyStart),
      });
    } catch (error: any) {
      toast.error(error.response.data.message || "Failed to fetch config");
    }
  };

  const onSubmit = async (values: CredentialsFormValues) => {
    console.log("Submitting values:", values);
    form.clearErrors("root.serverError");
    try {
      await api.patch("/attendance/config", values);
      fetchConfig();
      toast.success("Submitted values");
    } catch (error: any) {
      console.error("Submission error:", error);
      form.setError("root.serverError", {
        type: "manual",
        message: "Failed to update time configuration.",
      });
      toast.error(error.response.data.message || "Failed to update config");
    }
  };

  useEffect(() => {
    fetchConfig();
    setBreadcrumb(["Settings", "Time Configuration"]);
  }, []);

  return (
    <>
      <PageHeader>
        <div>
          <PageHeaderTitle value="Time Configurations" />
        </div>
      </PageHeader>

      <div className="rounded-lg border p-6">
        <div className="rounded-lg border p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex items-end space-x-4"
            >
              <FormField
                control={form.control}
                name="workStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" step={60} {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work End Time</FormLabel>
                    <FormControl>
                      <Input type="time" step={60} {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="otEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OT End Time</FormLabel>
                    <FormControl>
                      <Input type="time" step={60} {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="earlyStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Early Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" step={60} {...field} />
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

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Updating..." : "Update"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}

export default TimeConfigPage;
