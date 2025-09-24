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
import { toast } from "sonner";

import api from "@/api/axios";

function DeviceConfigPage() {
  const { setBreadcrumb } = useOutletContext<OutletContextType>();

  const credentialsSchema = z.object({
    ip: z.string().min(1, "Ip address is required"),
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
  });

  type CredentialsFormValues = z.infer<typeof credentialsSchema>;

  const form = useForm<CredentialsFormValues>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      ip: "",
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: CredentialsFormValues) => {
    form.clearErrors("root.serverError");
    try {
      const res = await api.post("/device/credentials", values);
      toast.success("Submitted values");
      console.log("Submitted values:", res);
    } catch (error) {
      form.setError("root.serverError", {
        type: "manual",
        message: "Failed to update device credentials.",
      });
      const message = "Failed to update device credentials.";
      toast.error(message);
    }
  };

  useEffect(() => {
    setBreadcrumb(["Settings", "Device Configuration"]);
  }, []);

  return (
    <>
      <PageHeader>
        <div>
          <PageHeaderTitle value="Device Configurations" />
        </div>
      </PageHeader>

      <div className="rounded-lg border p-6">
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 font-semibold">Device Credentials</h2>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex items-end space-x-4"
            >
              <FormField
                control={form.control}
                name="ip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device Ip</FormLabel>
                    <FormControl>
                      <Input placeholder="192.168.x.x" type="text" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="username" type="text" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="********"
                        type="password"
                        {...field}
                      />
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
      </div>
    </>
  );
}

export default DeviceConfigPage;
