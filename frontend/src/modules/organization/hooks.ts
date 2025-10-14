import { useMutation } from "@tanstack/react-query";
import { authClient } from "~/lib/auth-client";

export const SET_ACTIVE_ORGANIZATION_MUTATION_KEY = ["set-active-organization"];

export const useSetActiveOrganizationMutation = () => {
  return useMutation({
    mutationKey: SET_ACTIVE_ORGANIZATION_MUTATION_KEY,
    mutationFn: async (organizationId: string) => {
      const res = await authClient.organization.setActive({
        organizationId,
      });

      if (res.error) {
        throw new Error(res.error.message);
      }

      return res.data;
    },
    onSuccess: () => {
      // Refresh the page to reload the session with the new active organization
      window.location.href = "/";
    },
  });
};
