import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "~/lib/auth-client";
import { SESSION_QUERY_KEY } from "~/modules/auth/hooks";

export const SET_ACTIVE_ORGANIZATION_MUTATION_KEY = ["set-active-organization"];

export const useSetActiveOrganizationMutation = () => {
  const queryClient = useQueryClient();

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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
    },
  });
};
