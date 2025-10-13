"use client";

import {
  AudioWaveform,
  BarChart,
  Bot,
  Command,
  FileText,
  FlaskConical,
  GalleryVerticalEnd,
  LayoutDashboard,
  Rocket,
  SquareTerminal,
} from "lucide-react";
import type * as React from "react";

import { NavMain } from "~/components/nav-main";
import { NavProjects } from "~/components/nav-projects";
import { NavUser } from "~/components/nav-user";
import { TeamSwitcher } from "~/components/team-switcher";
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

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const primaryItems = SIDEBAR.filter((item) => !item.section);
  const secondaryItems = SIDEBAR.filter((item) => item.section === "secondary");

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={primaryItems} />
        <NavProjects projects={PROJECTS} />
        <NavMain items={secondaryItems} label="Resources" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
