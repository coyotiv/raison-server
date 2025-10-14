import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router";

import { Spinner } from "~/components/ui/spinner";
import { useSessionQuery } from "~/modules/auth/hooks";
import { useOrganizationsQuery } from "~/modules/onboarding/hooks";
import { useSetActiveOrganizationMutation } from "~/modules/organization/hooks";
import { AuthContext } from "~/providers/auth-context";

export const AuthProvider = (props: { children: React.ReactNode }) => {
  const location = useLocation();

  const { data, isLoading } = useSessionQuery();
  const { data: organizations, isLoading: isOrganizationsLoading } = useOrganizationsQuery({ enabled: !!data });
  const setActiveOrgMutation = useSetActiveOrganizationMutation();

  // Track if we've already attempted to set an active organization to prevent loops
  const hasAttemptedSetActive = useRef(false);
  const [isSettingActiveOrg, setIsSettingActiveOrg] = useState(false);

  const { user, session } = data || {};

  const isAuthPage = location.pathname.startsWith("/auth");
  const isOnboardingPage = location.pathname.startsWith("/onboarding");
  const isOnboardingMembersPage = location.pathname === "/onboarding/members";
  const hasActiveOrganization = !!session?.activeOrganizationId;
  const hasAnyOrganization = !!organizations?.length;

  // EXTREMELY SAFE: Automatically select first organization if no active org
  useEffect(() => {
    // Safety checks to prevent infinite loops and unnecessary calls
    const shouldSetActiveOrg =
      user && // User must be logged in
      hasAnyOrganization && // Must have at least one organization
      !hasActiveOrganization && // Must NOT have an active organization already
      !isAuthPage && // Not on auth pages
      !isOnboardingPage && // Not on onboarding pages
      !hasAttemptedSetActive.current && // Haven't already attempted
      !isSettingActiveOrg && // Not currently setting
      !setActiveOrgMutation.isPending && // Not already pending
      organizations && // Organizations data must exist
      organizations.length > 0 && // Must have at least one org in the array
      organizations[0]?.id; // First organization must have an ID

    if (shouldSetActiveOrg) {
      // Mark that we've attempted to prevent re-runs
      hasAttemptedSetActive.current = true;
      setIsSettingActiveOrg(true);

      // Set the first organization as active
      setActiveOrgMutation.mutate(organizations[0].id, {
        onSettled: () => {
          setIsSettingActiveOrg(false);
        },
      });
    }
  }, [
    user,
    hasAnyOrganization,
    hasActiveOrganization,
    isAuthPage,
    isOnboardingPage,
    organizations,
    setActiveOrgMutation,
    isSettingActiveOrg,
  ]);

  // Show loading spinner while initial data is loading OR while setting active org
  if (isLoading || isOrganizationsLoading || isSettingActiveOrg) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner size="6" />
      </div>
    );
  }

  if (!user && !isAuthPage) {
    return <Navigate to="/auth/login" replace={true} />;
  }

  if (user && !hasAnyOrganization && !isOnboardingPage && !isAuthPage) {
    return <Navigate to="/onboarding" replace={true} />;
  }

  // Allow users to stay on the members invitation page during onboarding
  if (user && hasActiveOrganization && isOnboardingPage && !isOnboardingMembersPage) {
    return <Navigate to="/" replace={true} />;
  }

  return (
    <AuthContext.Provider value={{ user: user || null, session: session || null }}>
      {props.children}
    </AuthContext.Provider>
  );
};
