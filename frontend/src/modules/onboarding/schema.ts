import { z } from "zod";

// Organization creation schema
export const CreateOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name must be at least 2 characters long")
    .max(100, "Organization name must be at most 100 characters long"),
  industry: z.string().min(1, "Please select an industry"),
  size: z.enum(["1-10", "11-50", "51-200", "201-500", "501+"]),
});

export type CreateOrganizationSchemaType = z.infer<typeof CreateOrganizationSchema>;

export const InviteMembersSchema = z.object({
  emails: z
    .array(
      z.object({
        email: z.email("Invalid email address"),
        role: z.enum(["admin", "member"]).default("member"),
      }),
    )
    .min(1, "Please add at least one email address")
    .max(10, "You can invite up to 10 members at once"),
});

export type InviteMembersSchemaType = z.infer<typeof InviteMembersSchema>;
