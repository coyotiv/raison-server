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

export type Team = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
};

export const teamsColumns: ColumnDef<Team>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <span className="font-medium">{row.getValue("name")}</span>;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      return <span className="text-muted-foreground">{row.getValue("description")}</span>;
    },
  },
  {
    accessorKey: "memberCount",
    header: "Members",
    cell: ({ row }) => {
      return <span>{row.getValue("memberCount")}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const _team = row.original;

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>Edit team</DropdownMenuItem>
              <DropdownMenuItem>Manage members</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4" />
                Delete team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
