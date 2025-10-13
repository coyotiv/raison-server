import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { authClient } from "~/lib/auth-client";
import type { CreateOrganizationSchemaType, InviteMembersSchemaType } from "~/modules/onboarding/schema";
import { useAuthContext } from "~/providers/auth-context";
import { generateRandomId } from "~/utils/random-id";

export const ORGANIZATIONS_QUERY_KEY = ["organizations"];
export const CREATE_ORGANIZATION_MUTATION_KEY = ["create-organization"];
export const INVITE_MEMBERS_MUTATION_KEY = ["invite-members"];

export const useOrganizationsQuery = (opts?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ORGANIZATIONS_QUERY_KEY,
    queryFn: async () => {
      const res = await authClient.organization.list();
      if (res.error) {
        throw new Error(res.error.message);
      }
      return res.data;
    },
    enabled: opts?.enabled ?? true,
  });
};

export function parseOrganizationName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, ""); // Remove special characters except hyphens
}

export function generateOrganizationSlug(name: string): string {
  const randomSuffix = generateRandomId(4);

  const slug = parseOrganizationName(name);

  return `${slug}-${randomSuffix}`;
}

export const useCreateOrganizationMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationKey: CREATE_ORGANIZATION_MUTATION_KEY,
    mutationFn: async (payload: CreateOrganizationSchemaType) => {
      const baseSlug = parseOrganizationName(payload.name);

      const checkResult = await authClient.organization.checkSlug({
        slug: baseSlug,
      });

      // Determine if slug is available
      // checkResult.data.status is true if available, false if taken
      let finalSlug: string;
      const isSlugAvailable = !checkResult.error && checkResult.data?.status === true;

      if (isSlugAvailable) {
        finalSlug = baseSlug;
      } else {
        finalSlug = generateOrganizationSlug(payload.name);
      }

      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        const res = await authClient.organization.create({
          name: payload.name,
          slug: finalSlug,
          metadata: {
            industry: payload.industry,
            size: payload.size,
          },
        });

        if (!res.error) {
          return res.data;
        }

        // Check if error is due to slug conflict using Better Auth's error code
        const errorCode = (res.error as any).code;
        const isSlugConflict =
          errorCode === "SLUG_IS_TAKEN" ||
          res.error.status === 409 ||
          res.error.status === 400 ||
          res.error.message?.toLowerCase().includes("already exists") ||
          res.error.message?.toLowerCase().includes("duplicate") ||
          res.error.message?.toLowerCase().includes("taken");

        if (isSlugConflict && attempts < maxAttempts - 1) {
          finalSlug = generateOrganizationSlug(payload.name);
          attempts++;
          continue;
        }

        throw new Error(res.error.message);
      }

      throw new Error("Failed to create organization after multiple attempts");
    },
    onSuccess: () => navigate("/onboarding/members"),
  });
};

export const useInviteMembersMutation = () => {
  const navigate = useNavigate();
  const { session } = useAuthContext();

  return useMutation({
    mutationKey: INVITE_MEMBERS_MUTATION_KEY,
    mutationFn: async (payload: InviteMembersSchemaType) => {
      if (!session?.activeOrganizationId) {
        throw new Error("Organization ID not found. Please create an organization first.");
      }

      // Invite members one by one using Better Auth
      const promises = payload.emails.map((invite) =>
        authClient.organization.inviteMember({
          organizationId: session.activeOrganizationId as string,
          email: invite.email,
          role: invite.role,
        }),
      );

      const results = await Promise.allSettled(promises);

      const failures = results.filter((result) => result.status === "rejected");
      if (failures.length > 0) {
        throw new Error(`Failed to invite ${failures.length} member(s)`);
      }

      return results;
    },
    onSuccess: () => navigate("/"),
  });
};
