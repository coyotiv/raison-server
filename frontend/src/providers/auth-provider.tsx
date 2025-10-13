import type React from "react";
import { Navigate, useLocation } from "react-router";

import { Spinner } from "~/components/ui/spinner";
import { useSessionQuery } from "~/modules/auth/hooks";
import { useOrganizationsQuery } from "~/modules/onboarding/hooks";
import { AuthContext } from "~/providers/auth-context";

export const AuthProvider = (props: { children: React.ReactNode }) => {
  const location = useLocation();

  const { data, isLoading } = useSessionQuery();
  const { data: organizations, isLoading: isOrganizationsLoading } = useOrganizationsQuery({ enabled: !!data });

  if (isLoading || isOrganizationsLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner size="6" />
      </div>
    );
  }

  const { user, session } = data || {};

  const isAuthPage = location.pathname.startsWith("/auth");
  const isOnboardingPage = location.pathname.startsWith("/onboarding");
  const isOnboardingMembersPage = location.pathname === "/onboarding/members";
  const isSelectOrganizationPage = location.pathname.startsWith("/select-organization");
  const hasActiveOrganization = !!session?.activeOrganizationId;
  const hasAnyOrganization = !!organizations?.length;

  if (!user && !isAuthPage) {
    return <Navigate to="/auth/login" replace={true} />;
  }

  if (user && !hasAnyOrganization && !isOnboardingPage && !isAuthPage) {
    return <Navigate to="/onboarding" replace={true} />;
  }

  if (user && hasAnyOrganization && !hasActiveOrganization && !isAuthPage) {
    return <Navigate to="/select-organization" replace={true} />;
  }

  // Allow users to stay on the members invitation page during onboarding
  if (user && hasActiveOrganization && isOnboardingPage && !isOnboardingMembersPage) {
    return <Navigate to="/" replace={true} />;
  }

  if (user && hasActiveOrganization && isSelectOrganizationPage) {
    return <Navigate to="/" replace={true} />;
  }

  return (
    <AuthContext.Provider value={{ user: user || null, session: session || null }}>
      {props.children}
    </AuthContext.Provider>
  );
};
