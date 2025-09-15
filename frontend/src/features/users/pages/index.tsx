import { DataTable } from "@/components/data-table";
import PageHeaderTitle from "@/components/page-header/title";
import PageHeader from "@/components/page-header/wrapper";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import api from "@/api/axios";
import { columns, type Employee } from "../components/columns";

function UsersPage1() {
  const { setBreadcrumb } = useOutletContext<OutletContextType>();
  const [data, setData] = useState<Employee[]>([]);

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
      console.log("Submitted values:", res);
    } catch (error) {
      form.setError("root.serverError", {
        type: "manual",
        message: "Failed to update device credentials.",
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/users`);
      setData(res.data);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const syncUsers = async () => {
    try {
      const res = await api.post(`/device/sync-users`);
      fetchUsers();
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setBreadcrumb(["Users1"]);
    fetchUsers();
  }, []);
  return (
    <>
      <PageHeader>
        <div>
          <PageHeaderTitle value="Users1" />
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
        <div className="flex items-end space-x-4 mt-3">
          <Button
            onClick={() => syncUsers()}
            type="button"
            className="bg-green-600"
            // disabled
          >
            Sync Users
          </Button>
          <Button type="button" className="bg-blue-600" disabled>
            Edit User
          </Button>
        </div>
        <div className="rounded-lg border p-6 mt-3">
          <h2 className="mb-4 font-semibold">Registered Users</h2>
          <DataTable columns={columns} data={data} />
        </div>
      </div>
    </>
  );
}
export default UsersPage1;
