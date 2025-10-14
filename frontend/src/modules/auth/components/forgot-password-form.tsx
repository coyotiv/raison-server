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
import { useForgotPasswordMutation } from "~/modules/auth/hooks";
import { ForgotPasswordSchema } from "~/modules/auth/schema";

export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<"div">) {
  const forgotPasswordMutation = useForgotPasswordMutation();

  const forgotPasswordForm = useForm({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(ForgotPasswordSchema),
    disabled: forgotPasswordMutation.isPending,
  });

  return (
    <div className={cn("relative isolate flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forgot password?</CardTitle>
          <CardDescription>Enter your email address and we'll send you a link to reset your password</CardDescription>
        </CardHeader>

        <CardContent>
          {forgotPasswordMutation.isSuccess ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-muted-foreground text-sm">
                Check your email for a link to reset your password. If it doesn't appear within a few minutes, check
                your spam folder.
              </p>
              <Button asChild className="w-full">
                <Link to="/auth/login">Return to login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={forgotPasswordForm.handleSubmit((d) => forgotPasswordMutation.mutate(d))}>
              <FieldGroup>
                {forgotPasswordMutation.isError && (
                  <Alert variant="destructive">
                    <AlertCircle />
                    <AlertTitle>Failed to send reset link</AlertTitle>
                    <AlertDescription>{forgotPasswordMutation.error?.message}</AlertDescription>
                  </Alert>
                )}
                <Controller
                  control={forgotPasswordForm.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input {...field} id="email" aria-invalid={fieldState.invalid} placeholder="m@example.com" />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Field>
                  <Button type="submit" disabled={forgotPasswordMutation.isPending}>
                    {forgotPasswordMutation.isPending && <Spinner />}
                    Send reset link
                  </Button>

                  <FieldDescription className="!mt-4 text-center text-xs">
                    Remember your password? <Link to="/auth/login">Sign in</Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          )}
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
  );
}
