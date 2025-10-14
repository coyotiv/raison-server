import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { useAuthContext } from "~/providers/auth-context";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { user } = useAuthContext();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    console.log("Profile update:", data);
    // TODO: Implement profile update mutation
  };

  const handleDeleteAccount = () => {
    console.log("Delete account");
    // TODO: Implement delete account mutation
  };

  const getUserInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-16 pb-16">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col gap-2 border-border border-b px-6 py-4">
          <h3 className="font-semibold text-lg">Profile Information</h3>
          <p className="text-muted-foreground text-sm">
            Update your profile information and manage your public presence.
          </p>
        </div>
        <div className="space-y-4 px-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.image || undefined} alt={user?.name || ""} />
              <AvatarFallback className="text-lg">{user?.name ? getUserInitials(user.name) : "??"}</AvatarFallback>
            </Avatar>
            <Button type="button" variant="outline" size="sm">
              Change Avatar
            </Button>
          </div>

          <div className="max-w-xl space-y-4">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
                  <Input {...field} id="name" aria-invalid={fieldState.invalid} />
                  <FieldDescription>Your full name as it will appear to other team members.</FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Field>
              <FieldLabel htmlFor="email">Email Address</FieldLabel>
              <Input id="email" type="email" value={user?.email || ""} disabled />
              <FieldDescription>Email address cannot be changed after registration.</FieldDescription>
            </Field>
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
          <h3 className="font-semibold text-lg">Password</h3>
          <p className="text-muted-foreground text-sm">Update your password to keep your account secure.</p>
        </div>
        <div className="space-y-4 px-6">
          <div className="max-w-xl space-y-4">
            <Field>
              <FieldLabel htmlFor="current-password">Current Password</FieldLabel>
              <Input id="current-password" type="password" />
            </Field>

            <Field>
              <FieldLabel htmlFor="new-password">New Password</FieldLabel>
              <Input id="new-password" type="password" />
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm-password">Confirm New Password</FieldLabel>
              <Input id="confirm-password" type="password" />
            </Field>
          </div>

          <div className="flex justify-start">
            <Button>Update Password</Button>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="space-y-6">
        <div className="flex flex-col gap-2 border-border border-y px-6 py-4">
          <h3 className="font-semibold text-lg">Two-Factor Authentication</h3>
          <p className="text-muted-foreground text-sm">Add an extra layer of security to your account.</p>
        </div>
        <div className="space-y-4 px-6">
          <p className="max-w-xl text-muted-foreground text-sm">
            Two-factor authentication adds an additional layer of security to your account by requiring more than just a
            password to sign in.
          </p>
          <Button variant="outline">Enable Two-Factor Authentication</Button>
        </div>
      </div>

      {/* Delete Account & Data Protection Section */}
      <div className="space-y-6">
        <div className="flex flex-col gap-2 border-border border-y px-6 py-4">
          <h3 className="font-semibold text-lg">Account Deletion & Data Protection</h3>
          <p className="text-muted-foreground text-sm">Manage your account data and deletion options.</p>
        </div>
        <div className="space-y-6 px-6">
          <div className="max-w-xl space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Your Data Rights</h4>
              <p className="text-muted-foreground text-sm">
                You have the right to request a copy of your data or permanently delete your account at any time. When
                you delete your account, all associated data will be permanently removed from our servers.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">What will be deleted:</h4>
              <ul className="list-inside list-disc space-y-1 text-muted-foreground text-sm">
                <li>Your profile and account information</li>
                <li>All your personal settings and preferences</li>
                <li>Your membership in all organizations</li>
                <li>All associated data and activity history</li>
              </ul>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="confirm-delete"
                  checked={confirmDelete}
                  onCheckedChange={(checked) => setConfirmDelete(!!checked)}
                />
                <div className="space-y-1">
                  <FieldLabel htmlFor="confirm-delete" className="cursor-pointer">
                    I understand that this action is permanent and cannot be undone
                  </FieldLabel>
                </div>
              </div>

              {confirmDelete && (
                <Field>
                  <FieldLabel htmlFor="delete-confirm">
                    Type <span className="font-mono font-semibold">DELETE</span> to confirm
                  </FieldLabel>
                  <Input
                    id="delete-confirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                  />
                </Field>
              )}

              <Button
                variant="destructive"
                disabled={!confirmDelete || deleteConfirmText !== "DELETE"}
                onClick={handleDeleteAccount}
              >
                Delete Account Permanently
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
