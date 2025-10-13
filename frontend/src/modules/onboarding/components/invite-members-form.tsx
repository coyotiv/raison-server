import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Plus, UserPlus, X } from "lucide-react";
import type React from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Spinner } from "~/components/ui/spinner";
import { cn } from "~/lib/utils";
import { useInviteMembersMutation } from "~/modules/onboarding/hooks";
import { InviteMembersSchema } from "~/modules/onboarding/schema";

export function InviteMembersForm({ className, ...props }: React.ComponentProps<"div">) {
  const navigate = useNavigate();

  const inviteMutation = useInviteMembersMutation();

  const form = useForm({
    defaultValues: {
      emails: [{ email: "", role: "member" as const }],
    },
    resolver: zodResolver(InviteMembersSchema),
    disabled: inviteMutation.isPending,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "emails",
  });

  const handleAddEmail = () => {
    if (fields.length < 5) {
      append({ email: "", role: "member" });
    }
  };

  const handleRemoveEmail = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="relative isolate">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Invite team members</CardTitle>

            <CardDescription>Collaborate with your team by inviting members to your organization.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit((d) => inviteMutation.mutate(d))}>
              <FieldGroup>
                {inviteMutation.isError && (
                  <Alert variant="destructive">
                    <AlertCircle />
                    <AlertTitle>Failed to send invitations</AlertTitle>
                    <AlertDescription>{inviteMutation.error?.message}</AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col gap-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <div className="flex-1">
                        <Controller
                          control={form.control}
                          name={`emails.${index}.email`}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className="gap-1">
                              {index === 0 && <FieldLabel htmlFor={`email-${index}`}>Email Address</FieldLabel>}
                              <Input
                                {...field}
                                id={`email-${index}`}
                                aria-invalid={fieldState.invalid}
                                placeholder="colleague@example.com"
                                type="email"
                              />
                              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />
                      </div>

                      <div className="w-32">
                        <Controller
                          control={form.control}
                          name={`emails.${index}.role`}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className="gap-1">
                              {index === 0 && <FieldLabel htmlFor={`role-${index}`}>Role</FieldLabel>}
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger id={`role-${index}`} aria-invalid={fieldState.invalid}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="member">Member</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />
                      </div>

                      <div className={cn("flex items-end")}>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemoveEmail(index)}
                          disabled={fields.length === 1}
                          className="h-9 w-9"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {fields.length < 5 && (
                  <Button type="button" variant="outline" onClick={handleAddEmail} className="w-full">
                    <Plus className="h-4 w-4" />
                    Add another email
                  </Button>
                )}

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => navigate("/")} className="flex-1">
                    Skip for now
                  </Button>
                  <Button type="submit" disabled={inviteMutation.isPending} className="flex-1">
                    {inviteMutation.isPending && <Spinner />}
                    Send invitations
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <div className="-bottom-1.5 -z-10 absolute right-px left-px flex h-6 overflow-hidden rounded-b-xl shadow-inner">
          <span className="flex-1 bg-red-500" />
          <span className="flex-1 bg-orange-500" />
          <span className="flex-1 bg-yellow-500" />
          <span className="flex-1 bg-green-500" />
          <span className="flex-1 bg-blue-500" />
          <span className="flex-1 bg-purple-500" />
        </div>
      </div>
    </div>
  );
}
