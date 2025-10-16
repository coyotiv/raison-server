"use client";

import {
  BarChart3,
  BookOpen,
  Bot,
  Compass,
  Database,
  LayoutDashboard,
  Puzzle,
  SquareTerminal,
  Workflow,
} from "lucide-react";
import type * as React from "react";

import { NavMain } from "~/components/nav-main";
import { NavUser } from "~/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "~/components/ui/sidebar";
import { OrganizationSwitcher } from "~/modules/organization/components/organization-switcher";

const MAIN_NAV = [
  { label: "Overview", path: "/", icon: LayoutDashboard },
  { label: "Agents", path: "/agents", icon: Bot },
  { label: "Prompt Builder", path: "/prompt-builder", icon: Workflow },
  { label: "Environment", path: "/environment", icon: Database },
  { label: "Explore", path: "/explore", icon: Compass },
  { label: "Playground", path: "/playground", icon: SquareTerminal },
];

const SECONDARY_NAV = [
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Integrations", path: "/integrations", icon: Puzzle },
  { label: "Documentation", path: "https://docs.example.com", icon: BookOpen, external: true },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganizationSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={MAIN_NAV} />
        <NavMain items={SECONDARY_NAV} label="More" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
