"use client";

import { BarChart, Bot, FileText, FlaskConical, LayoutDashboard, Rocket, SquareTerminal } from "lucide-react";
import type * as React from "react";

import { NavMain } from "~/components/nav-main";
import { NavProjects } from "~/components/nav-projects";
import { NavUser } from "~/components/nav-user";
import { OrganizationSwitcher } from "~/components/organization-switcher";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "~/components/ui/sidebar";

export type ProjectItem = { id: string; name: string; icon?: string };

const SIDEBAR = [
  { label: "Overview", path: "/project/:id", icon: LayoutDashboard },
  { label: "Agents", path: "/project/:id/agents", icon: Bot },
  { label: "Releases", path: "/project/:id/releases", icon: Rocket },
  {
    label: "Experiments",
    path: "/project/:id/agents/:agent_id/experiments",
    icon: FlaskConical,
  },
  {
    label: "Playground",
    path: "/project/:id/playground",
    icon: SquareTerminal,
  },
  {
    label: "Analytics",
    path: "/project/:id/analytics",
    section: "secondary",
    icon: BarChart,
  },
  {
    label: "Docs",
    path: "/docs",
    section: "secondary",
    external: true,
    icon: FileText,
  },
];

const PROJECTS: ProjectItem[] = [
  { id: "design-eng", name: "Design Engineering" },
  { id: "sales-mkt", name: "Sales & Marketing" },
  { id: "travel", name: "Travel" },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const primaryItems = SIDEBAR.filter((item) => !item.section);
  const secondaryItems = SIDEBAR.filter((item) => item.section === "secondary");

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganizationSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={primaryItems} />
        <NavProjects projects={PROJECTS} />
        <NavMain items={secondaryItems} label="Resources" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
