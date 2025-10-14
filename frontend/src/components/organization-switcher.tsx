"use client";

import { ChevronsUpDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "~/components/ui/sidebar";
import { useOrganizationsQuery } from "~/modules/onboarding/hooks";
import { useSetActiveOrganizationMutation } from "~/modules/organization/hooks";
import { useAuthContext } from "~/providers/auth-context";

export function OrganizationSwitcher() {
  const { isMobile } = useSidebar();
  const { session } = useAuthContext();
  const { data: organizations, isLoading } = useOrganizationsQuery();
  const setActiveOrgMutation = useSetActiveOrganizationMutation();

  const activeOrganization = organizations?.find((org) => org.id === session?.activeOrganizationId);

  const handleOrganizationSwitch = (organizationId: string) => {
    if (organizationId === session?.activeOrganizationId) return;
    setActiveOrgMutation.mutate(organizationId);
  };

  if (isLoading || !activeOrganization) {
    return null;
  }

  const getOrganizationInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary font-semibold text-sidebar-primary-foreground text-sm">
                {getOrganizationInitial(activeOrganization.name)}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeOrganization.name}</span>
                <span className="truncate text-muted-foreground text-xs">
                  {activeOrganization.slug ? `@${activeOrganization.slug}` : "Organization"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">Organizations</DropdownMenuLabel>
            {organizations?.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleOrganizationSwitch(org.id)}
                className="gap-2 p-2"
                disabled={setActiveOrgMutation.isPending}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-muted font-medium text-xs">
                  {getOrganizationInitial(org.name)}
                </div>
                {org.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
