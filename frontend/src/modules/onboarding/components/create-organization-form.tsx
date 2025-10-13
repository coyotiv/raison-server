import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Building2 } from "lucide-react";
import type React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Spinner } from "~/components/ui/spinner";
import { cn } from "~/lib/utils";
import { useCreateOrganizationMutation } from "~/modules/onboarding/hooks";
import { CreateOrganizationSchema } from "~/modules/onboarding/schema";

export function CreateOrganizationForm({ className, ...props }: React.ComponentProps<"div">) {
  const createOrgMutation = useCreateOrganizationMutation();

  const form = useForm({
    defaultValues: {
      name: "",
      industry: "",
    },
    resolver: zodResolver(CreateOrganizationSchema),
    disabled: createOrgMutation.isPending,
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="relative isolate">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Create your organization</CardTitle>
            <CardDescription>Set up your workspace to get started.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit((d) => createOrgMutation.mutate(d))}>
              <FieldGroup>
                {createOrgMutation.isError && (
                  <Alert variant="destructive">
                    <AlertCircle />
                    <AlertTitle>Failed to create organization</AlertTitle>
                    <AlertDescription>{createOrgMutation.error?.message}</AlertDescription>
                  </Alert>
                )}

                <Controller
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="name">Organization Name</FieldLabel>
                      <Input {...field} id="name" aria-invalid={fieldState.invalid} placeholder="Acme Inc." />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="industry"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="industry">Industry</FieldLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="industry" aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="consulting">Consulting</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="size"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="size">Company Size</FieldLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="size" aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="501+">501+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Field>
                  <Button type="submit" disabled={createOrgMutation.isPending} className="w-full">
                    {createOrgMutation.isPending && <Spinner />}
                    Continue
                  </Button>
                </Field>
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
