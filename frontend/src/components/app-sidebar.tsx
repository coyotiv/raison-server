"use client";

import { Bot, Database, FileText, LayoutDashboard, SquareTerminal } from "lucide-react";
import type * as React from "react";

import { NavMain } from "~/components/nav-main";
import { NavProjects } from "~/components/nav-projects";
import { NavUser } from "~/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "~/components/ui/sidebar";
import { OrganizationSwitcher } from "~/modules/organization/components/organization-switcher";

export type TeamItem = { id: string; name: string; icon?: string };

const SIDEBAR = [
  { label: "Overview", path: "/", icon: LayoutDashboard },
  { label: "Agents", path: "/agents", icon: Bot },
  { label: "Prompts", path: "/prompts", icon: FileText },
  { label: "Environments", path: "/environments", icon: Database },
  { label: "Playground", path: "/playground", icon: SquareTerminal },
];

const TEAMS: TeamItem[] = [
  { id: "example-team-1", name: "example team 1" },
  { id: "example-team-2", name: "example team 2" },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganizationSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={SIDEBAR} />
        <NavProjects projects={TEAMS} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
