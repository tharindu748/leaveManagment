import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, X } from "lucide-react";
import { useEffect } from "react";
import { useForm, type DefaultValues } from "react-hook-form";
import { z } from "zod";
import type { User } from "../pages";

const userSchema = z.object({
  name: z.string().min(1, "User Name is Required"),
  email: z.string().optional(),
  epfNo: z.string().optional(),
  nic: z.string().optional(),
  jobPosition: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function EditUserDialog({
  open,
  onOpenChange,
  user,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  user: User;
  onSaved?: (updated: UserFormValues) => void;
}) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      epfNo: user?.epfNo ?? "",
      nic: user?.nic ?? "",
      jobPosition: user?.jobPosition ?? "",
    } satisfies DefaultValues<UserFormValues>,
  });

  useEffect(() => {
    if (open && user) {
      form.reset({
        name: user.name ?? "",
        email: user.email ?? "",
        epfNo: user.epfNo ?? "",
        nic: user.nic ?? "",
        jobPosition: user.jobPosition ?? "",
      });
    }
  }, [open, user, form]);

  const onSubmit = async (values: UserFormValues) => {
    form.clearErrors("root.serverError");
    console.log(values);
    try {
      await api.put(`/users/${user.id}`, values);
      onSaved?.(values);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating user:", error);
      form.setError("root.serverError", {
        type: "manual",
        message: "Failed to update user. Please try again.",
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl [&>button]:hidden p-6 overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle>Edit User</DialogTitle>
            </div>
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
                className="gap-2 bg-gray-800 hover:bg-black text-white"
                type="submit"
                form="user-form"
                disabled={form.formState.isSubmitting}
              >
                <Save className="h-4 w-4" />
                {form.formState.isSubmitting ? "Saving..." : "Save User"}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4">
          <Form {...form}>
            <form
              id="user-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Project Manager"
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Type the email No here"
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="epfNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>EPF No</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Type the EPF No here"
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIC</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Type the NIC No here"
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobPosition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Position</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Type the NIC No here"
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {form.formState.errors.root?.serverError && (
                <div className="text-sm text-red-600">
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
