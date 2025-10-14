import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { useOrganizationsQuery } from "~/modules/onboarding/hooks";
import { useAuthContext } from "~/providers/auth-context";

const organizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

export function GeneralPage() {
  const { session } = useAuthContext();
  const { data: organizations } = useOrganizationsQuery();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const activeOrganization = organizations?.find((org) => org.id === session?.activeOrganizationId);

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: activeOrganization?.name || "",
      slug: activeOrganization?.slug || "",
    },
  });

  const onSubmit = (data: OrganizationFormData) => {
    console.log("Organization update:", data);
    // TODO: Implement organization update mutation
  };

  const handleDeleteOrganization = () => {
    console.log("Delete organization");
    // TODO: Implement delete organization mutation
  };

  return (
    <div className="space-y-16 pb-16">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col gap-2 border-border border-b px-6 py-4">
          <h3 className="font-semibold text-lg">Organization Information</h3>
          <p className="text-muted-foreground text-sm">Update your organization's profile information.</p>
        </div>
        <div className="space-y-4 px-6">
          <div className="max-w-xl space-y-4">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="org-name">Organization Name</FieldLabel>
                  <Input {...field} id="org-name" aria-invalid={fieldState.invalid} />
                  <FieldDescription>This is your organization's visible name within the app.</FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="slug"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="org-slug">Organization Slug</FieldLabel>
                  <Input {...field} id="org-slug" aria-invalid={fieldState.invalid} disabled />
                  <FieldDescription>
                    This is your organization's unique identifier (cannot be changed).
                  </FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          <div className="flex justify-start">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
              Save changes
            </Button>
          </div>
        </div>
      </form>

      <div className="space-y-6">
        <div className="flex flex-col gap-2 border-border border-y px-6 py-4">
          <h3 className="font-semibold text-lg">Delete Organization</h3>
          <p className="text-muted-foreground text-sm">Permanently delete this organization and all of its data.</p>
        </div>
        <div className="space-y-6 px-6">
          <div className="max-w-xl space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Organization Data Protection</h4>
              <p className="text-muted-foreground text-sm">
                Deleting your organization is a permanent action that will remove all associated data, projects, and
                member access. This action cannot be undone.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">What will be deleted:</h4>
              <ul className="list-inside list-disc space-y-1 text-muted-foreground text-sm">
                <li>Organization profile and settings</li>
                <li>All projects and associated data</li>
                <li>All agents, experiments, and results</li>
                <li>Team member access and invitations</li>
                <li>Billing and subscription information</li>
              </ul>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="confirm-delete-org"
                  checked={confirmDelete}
                  onCheckedChange={(checked) => setConfirmDelete(!!checked)}
                />
                <div className="space-y-1">
                  <FieldLabel htmlFor="confirm-delete-org" className="cursor-pointer">
                    I understand that this action is permanent and cannot be undone
                  </FieldLabel>
                </div>
              </div>

              {confirmDelete && (
                <Field>
                  <FieldLabel htmlFor="delete-confirm-org">
                    Type <span className="font-mono font-semibold">DELETE</span> to confirm
                  </FieldLabel>
                  <Input
                    id="delete-confirm-org"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                  />
                </Field>
              )}

              <Button
                variant="destructive"
                disabled={!confirmDelete || deleteConfirmText !== "DELETE"}
                onClick={handleDeleteOrganization}
              >
                Delete Organization Permanently
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
