import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import type { User } from "../pages";
// import { User } from "../pages"; // <- import User type

export type Employee = {
  employeeId: string;
  name: string;
  email: string;
  efpNo: string;
  nic: string;
  jobPosition: string;
};

export const columns = (
  onEdit: (user: User) => void
): ColumnDef<Employee>[] => [
  { accessorKey: "employeeId", header: "Employee Id" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "efpNo", header: "EPF No" },
  { accessorKey: "nic", header: "NIC" },
  { accessorKey: "jobPosition", header: "Job Position" },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const r = row.original;
      return (
        <Button
          size="sm"
          className="bg-black text-white"
          onClick={() =>
            onEdit({
              id: r.employeeId,
              name: r.name,
              email: r.email,
              epfNo: r.efpNo,
              nic: r.nic,
              jobPosition: r.jobPosition,
            })
          }
        >
          Edit
        </Button>
      );
    },
  },
];
