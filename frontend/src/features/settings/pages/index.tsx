import type { OutletContextType } from "@/layouts/main-layout";
import { useEffect, useRef, useState } from "react";
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
  const [deviceBlock, setDeviceBlock] = useState(false);

  const deviceBlockRef = useRef(deviceBlock);

  useEffect(() => {
    deviceBlockRef.current = deviceBlock;
  }, [deviceBlock]);

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
      await api.post("/device/credentials", values);
      checkDeviceConnection();
      toast.success("Submitted values");
    } catch (error: any) {
      form.setError("root.serverError", {
        type: "manual",
        message: "Failed to update device credentials.",
      });
      const message = "Failed to update device credentials.";
      toast.error(error.response.data.message || message);
    }
  };

  const checkDeviceConnection = async () => {
    try {
      const res = await api.get("/device/auth-status");
      setDeviceBlock(res.data.blocked);
      console.log(res.data.blocked, "blocked");
    } catch (error: any) {
      toast.error(
        error.response.data.message || "Failed to check device connection"
      );
    }
  };

  useEffect(() => {
    checkDeviceConnection();

    const time = setInterval(() => {
      checkDeviceConnection();
    }, 5000);

    return () => clearInterval(time);
  }, []);

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
        <div className="rounded-lg border p-6 mb-3">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex gap-2">
              <h2 className="font-semibold">
                Device Connection:{" "}
                <span
                  className={`${
                    deviceBlock
                      ? "bg-red-200 border-red-600 text-red-600"
                      : "bg-green-200 border-green-600 text-green-600 "
                  }   border font-light pt-1 pb-2 px-3 rounded-sm`}
                >
                  {deviceBlock ? "Disconnected " : "Connected"}{" "}
                </span>
              </h2>
            </div>
          </div>
        </div>
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
