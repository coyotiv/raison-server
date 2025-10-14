import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export type Member = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  status: "active" | "invited" | "deactivated";
  teams: string[];
};

export const membersColumns: ColumnDef<Member>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <span className="font-medium">{row.getValue("name")}</span>;
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      return <span className="text-muted-foreground">{row.getValue("email")}</span>;
    },
  },
  {
    accessorKey: "teams",
    header: "Teams",
    cell: ({ row }) => {
      const teams = row.getValue("teams") as string[];
      if (!teams || teams.length === 0) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {teams.map((team) => (
            <span key={team} className="rounded bg-muted px-2 py-0.5 text-xs">
              {team}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const roleColors = {
        owner: "text-purple-600 bg-purple-50 dark:bg-purple-950",
        admin: "text-blue-600 bg-blue-50 dark:bg-blue-950",
        member: "text-gray-600 bg-gray-50 dark:bg-gray-950",
      };
      return (
        <span className={`rounded px-2 py-0.5 text-xs capitalize ${roleColors[role as keyof typeof roleColors]}`}>
          {role}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusColors = {
        active: "text-green-600 bg-green-50 dark:bg-green-950",
        invited: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950",
        deactivated: "text-red-600 bg-red-50 dark:bg-red-950",
      };
      return (
        <span className={`rounded px-2 py-0.5 text-xs capitalize ${statusColors[status as keyof typeof statusColors]}`}>
          {status}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const member = row.original;

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={member.role === "owner"}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" disabled={member.role === "owner"}>
                <Trash2 className="h-4 w-4" />
                Remove member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
