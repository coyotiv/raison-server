import { Navigate } from "react-router";
import { SidebarLayout } from "~/layouts/sidebar-layout";

const settingsNavGroups = [
  {
    label: "Account",
    items: [
      { label: "Profile", path: "/settings/profile" },
      { label: "Preferences", path: "/settings/preferences" },
      { label: "Notifications", path: "/settings/notifications" },
    ],
  },
  {
    label: "Organization",
    items: [
      { label: "General", path: "/settings/general" },
      { label: "Members", path: "/settings/members" },
      { label: "Billing", path: "/settings/billing" },
      { label: "Integrations", path: "/settings/integrations" },
    ],
  },
];

export function SettingsPage() {
  return (
    <SidebarLayout
      title="Settings"
      description="Manage your account and organization settings."
      navGroups={settingsNavGroups}
    />
  );
}

export function SettingsIndexPage() {
  return <Navigate to="/settings/profile" replace />;
}
