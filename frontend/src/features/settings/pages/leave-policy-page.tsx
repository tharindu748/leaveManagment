import type { OutletContextType } from "@/layouts/main-layout";
import { useEffect, useState } from "react";
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
import { DataTable2 } from "@/components/data-table";
import { columns, type LeavePolicy } from "../components/column";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

function LeavePolicyPage() {
  const { setBreadcrumb } = useOutletContext<OutletContextType>();
  const [data, setData] = useState<LeavePolicy[]>([]);

  const credentialsSchema = z.object({
    leaveType: z.string().min(1, "Leave type address is required"),
    defaultBalance: z.string().min(1, "Default Balance is required"),
  });

  type LeavePolicyValueForm = z.infer<typeof credentialsSchema>;

  const form = useForm<LeavePolicyValueForm>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      leaveType: "",
      defaultBalance: "",
    },
  });

  const fetchLeavePolicy = async () => {
    try {
      const res = await api.get("/leave/policy");
      setData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmit = async (values: LeavePolicyValueForm) => {
    form.clearErrors("root.serverError");
    try {
      const res = await api.patch("/leave/policy", values);
      toast.success("Submitted values");
      console.log("Submitted values:", res);
    } catch (error) {
      form.setError("root.serverError", {
        type: "manual",
        message: "Failed to update device credentials.",
      });
    }
  };

  useEffect(() => {
    setBreadcrumb(["Settings", "Leave Policy"]);
    fetchLeavePolicy();
  }, []);

  return (
    <>
      <PageHeader>
        <div>
          <PageHeaderTitle value="Leave Policy" />
        </div>
      </PageHeader>

      <div className="rounded-lg border p-6">
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 font-semibold">Leave Policy Details</h2>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex items-end space-x-4"
            >
              <FormField
                control={form.control}
                name="leaveType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Direction</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(v) =>
                          field.onChange(v as "ANNUAL" | "CASUAL")
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Leave Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ANNUAL">ANNUAL</SelectItem>
                          <SelectItem value="CASUAL">CASUAL</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="defaultBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Balance</FormLabel>
                    <FormControl>
                      <Input placeholder="balance" type="text" {...field} />
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
                {form.formState.isSubmitting ? "Updating..." : "Update"}
              </Button>
            </form>
          </Form>
        </div>
        <div className="rounded-lg border p-6 mt-3">
          <DataTable2 columns={columns} data={data} />
        </div>
      </div>
    </>
  );
}

export default LeavePolicyPage;
