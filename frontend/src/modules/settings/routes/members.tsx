import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Plus, UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { type Member, membersColumns } from "~/modules/settings/components/members-columns";
import { type Team, teamsColumns } from "~/modules/settings/components/teams-columns";

export function MembersPage() {
  const [memberFilters, setMemberFilters] = useState([]);
  const [teamFilters, setTeamFilters] = useState([]);
  const [memberTab, setMemberTab] = useState<"all" | "deactivated">("all");

  // Mock teams data
  const teams: Team[] = [
    { id: "1", name: "Engineering", description: "Product development team", memberCount: 12 },
    { id: "2", name: "Design", description: "Design and UX team", memberCount: 5 },
    { id: "3", name: "Marketing", description: "Marketing and growth team", memberCount: 8 },
    { id: "4", name: "Sales", description: "Sales and business development", memberCount: 6 },
  ];

  // Mock members data
  const members: Member[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "owner",
      status: "active",
      teams: ["Engineering", "Design"],
    },
    { id: "2", name: "Jane Smith", email: "jane@example.com", role: "admin", status: "active", teams: ["Engineering"] },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "member",
      status: "active",
      teams: ["Marketing", "Sales"],
    },
    { id: "4", name: "Alice Williams", email: "alice@example.com", role: "member", status: "invited", teams: [] },
    {
      id: "5",
      name: "Charlie Brown",
      email: "charlie@example.com",
      role: "member",
      status: "active",
      teams: ["Design"],
    },
    {
      id: "6",
      name: "David Miller",
      email: "david@example.com",
      role: "member",
      status: "deactivated",
      teams: ["Marketing"],
    },
  ];

  const teamsTable = useReactTable({
    data: teams,
    columns: teamsColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setTeamFilters as any,
    state: {
      columnFilters: teamFilters,
    },
  });

  const filteredMembers =
    memberTab === "all"
      ? members.filter((m) => m.status !== "deactivated")
      : members.filter((m) => m.status === "deactivated");

  const membersTable = useReactTable({
    data: filteredMembers,
    columns: membersColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setMemberFilters as any,
    state: {
      columnFilters: memberFilters,
    },
  });

  return (
    <div className="space-y-16 pb-16">
      <div className="space-y-6">
        <div className="flex flex-col gap-2 border-border border-b px-6 py-4">
          <h3 className="font-semibold text-lg">Teams</h3>
          <p className="text-muted-foreground text-sm">Organize your members into teams for better collaboration.</p>
        </div>
        <div className="space-y-4 px-6">
          <div className="flex items-center justify-between">
            <Input
              placeholder="Filter teams..."
              value={(teamsTable.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) => teamsTable.getColumn("name")?.setFilterValue(event.target.value)}
              className="max-w-sm"
            />
            <Button>
              <Plus />
              Create Team
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {teamsTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {teamsTable.getRowModel().rows?.length ? (
                  teamsTable.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={teamsColumns.length} className="h-24 text-center">
                      No teams found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-2 border-border border-y px-6 py-4">
          <h3 className="font-semibold text-lg">Members</h3>
          <p className="text-muted-foreground text-sm">Manage members and their roles in your organization.</p>
        </div>
        <div className="space-y-4 px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Tabs value={memberTab} onValueChange={(v) => setMemberTab(v as "all" | "deactivated")}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="deactivated">Deactivated</TabsTrigger>
                </TabsList>
              </Tabs>
              <Input
                placeholder="Filter members..."
                value={(membersTable.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) => membersTable.getColumn("name")?.setFilterValue(event.target.value)}
                className="max-w-sm"
              />
            </div>
            <Button>
              <UserPlus />
              Invite Member
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {membersTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {membersTable.getRowModel().rows?.length ? (
                  membersTable.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={membersColumns.length} className="h-24 text-center">
                      No members found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
