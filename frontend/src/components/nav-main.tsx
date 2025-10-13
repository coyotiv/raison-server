import { ExternalLink, type LucideIcon } from "lucide-react";
import { Link } from "react-router";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

export function NavMain({
  items,
  label,
}: {
  items: {
    label: string;
    path: string;
    icon?: LucideIcon;
    external?: boolean;
  }[];
  label?: string;
}) {
  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.path}>
            <SidebarMenuButton asChild tooltip={item.label}>
              {item.external ? (
                <a href={item.path} target="_blank" rel="noopener noreferrer">
                  {item.icon && <item.icon />}
                  <span>{item.label}</span>
                  <ExternalLink className="ml-auto h-4 w-4" />
                </a>
              ) : (
                <Link to={item.path}>
                  {item.icon && <item.icon />}
                  <span>{item.label}</span>
                </Link>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
