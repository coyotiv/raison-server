import { Link, Outlet, useLocation } from "react-router";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

type NavItem = {
  label: string;
  path: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

type SidebarLayoutProps = {
  title: string;
  description: string;
  navGroups: NavGroup[];
};

export function SidebarLayout({ title, description, navGroups }: SidebarLayoutProps) {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="flex flex-col gap-2 p-6">
          <h1 className="font-semibold text-2xl">{title}</h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </header>

      {/* Content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar using Shadcn components */}
        <aside className="w-64 overflow-auto border-r bg-sidebar">
          <div className="space-y-2 p-4">
            {navGroups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton asChild isActive={isActive}>
                            <Link to={item.path}>{item.label}</Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
