import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import type React from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Spinner } from "~/components/ui/spinner";
import { cn } from "~/lib/utils";
import { useResetPasswordMutation } from "~/modules/auth/hooks";
import { ResetPasswordSchema } from "~/modules/auth/schema";

interface ResetPasswordFormProps extends React.ComponentProps<"div"> {
  token: string;
}

export function ResetPasswordForm({ token, className, ...props }: ResetPasswordFormProps) {
  const resetPasswordMutation = useResetPasswordMutation();

  const resetPasswordForm = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(ResetPasswordSchema),
    disabled: resetPasswordMutation.isPending,
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="relative isolate">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Reset your password</CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={resetPasswordForm.handleSubmit((d) => resetPasswordMutation.mutate({ ...d, token }))}>
              <FieldGroup>
                {resetPasswordMutation.isError && (
                  <Alert variant="destructive">
                    <AlertCircle />
                    <AlertTitle>Failed to reset password</AlertTitle>
                    <AlertDescription>{resetPasswordMutation.error?.message}</AlertDescription>
                  </Alert>
                )}
                <Controller
                  control={resetPasswordForm.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="password">New Password</FieldLabel>
                      <Input {...field} id="password" type="password" aria-invalid={fieldState.invalid} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  control={resetPasswordForm.control}
                  name="confirmPassword"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
                      <Input {...field} id="confirmPassword" type="password" aria-invalid={fieldState.invalid} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Field>
                  <Button type="submit" disabled={resetPasswordMutation.isPending}>
                    {resetPasswordMutation.isPending && <Spinner />}
                    Reset password
                  </Button>

                  <FieldDescription className="!mt-4 text-center text-xs">
                    Remember your password? <Link to="/auth/login">Sign in</Link>
                  </FieldDescription>
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
