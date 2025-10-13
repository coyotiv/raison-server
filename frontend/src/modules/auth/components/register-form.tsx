import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import type React from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Spinner } from "~/components/ui/spinner";
import { cn } from "~/lib/utils";
import { useGoogleSignIn, useRegisterMutation } from "~/modules/auth/hooks";
import { RegisterSchema } from "~/modules/auth/schema";

export function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
  const registerMutation = useRegisterMutation();
  const googleSignIn = useGoogleSignIn();

  const registerForm = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(RegisterSchema),
    disabled: registerMutation.isPending,
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="relative isolate">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Create an account</CardTitle>
            <CardDescription>Enter your information to get started</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={registerForm.handleSubmit((d) => registerMutation.mutate(d))}>
              <FieldGroup>
                {(registerMutation.isError || googleSignIn.isError) && (
                  <Alert variant="destructive">
                    <AlertCircle />
                    <AlertTitle>Failed to create an account</AlertTitle>
                    <AlertDescription>
                      {registerMutation.error?.message || googleSignIn.error?.message}
                    </AlertDescription>
                  </Alert>
                )}
                <Field>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => googleSignIn.mutate()}
                    disabled={googleSignIn.isPending}
                  >
                    {googleSignIn.isPending ? (
                      <Spinner />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                    Sign up with Google
                  </Button>
                </Field>

                <FieldSeparator className="text-xs leading-5 *:data-[slot=field-separator-content]:bg-card">
                  Or continue with
                </FieldSeparator>

                <Controller
                  control={registerForm.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="name">Name</FieldLabel>
                      <Input {...field} id="name" aria-invalid={fieldState.invalid} placeholder="John Doe" />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  control={registerForm.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input {...field} id="email" aria-invalid={fieldState.invalid} placeholder="m@example.com" />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  control={registerForm.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Input {...field} id="password" type="password" aria-invalid={fieldState.invalid} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                      <Input {...field} id="confirmPassword" type="password" aria-invalid={fieldState.invalid} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Field>
                  <Button type="submit" disabled={registerMutation.isPending}>
                    {registerMutation.isPending && <Spinner />}
                    Create account
                  </Button>

                  <FieldDescription className="!mt-4 text-center text-xs">
                    Already have an account? <Link to="/auth/login">Sign in</Link>
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

      <FieldDescription className="px-6 text-center text-xs leading-relaxed">
        By clicking continue, you agree to our <Link to="/terms-of-services">Terms of Service</Link> and{" "}
        <Link to="/privacy-policy">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  );
}
