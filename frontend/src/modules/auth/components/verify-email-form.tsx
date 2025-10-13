import { AlertCircle } from "lucide-react";
import type React from "react";
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { FieldDescription } from "~/components/ui/field";
import { Spinner } from "~/components/ui/spinner";
import { cn } from "~/lib/utils";
import { useVerifyEmailMutation } from "~/modules/auth/hooks";

export function VerifyEmailForm({ className, ...props }: React.ComponentProps<"div">) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const verifyEmailMutation = useVerifyEmailMutation();

  useEffect(() => {
    if (token) {
      verifyEmailMutation.mutate({ token });
    }
  }, [token, verifyEmailMutation.mutate]);

  if (!token) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="relative isolate">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Invalid Verification Link</CardTitle>
              <CardDescription>
                The verification link is invalid or has expired. Please request a new one.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/auth/login">Return to login</Link>
              </Button>
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

  if (verifyEmailMutation.isSuccess) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="relative isolate">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Email Verified!</CardTitle>
              <CardDescription>Your email has been successfully verified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
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
              <p className="text-muted-foreground text-sm">Redirecting you to the app...</p>
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

  if (verifyEmailMutation.isError) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="relative isolate">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Verification Failed</CardTitle>
              <CardDescription>We couldn't verify your email address.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle />
                <AlertTitle>Email verification failed</AlertTitle>
                <AlertDescription>{verifyEmailMutation.error?.message}</AlertDescription>
              </Alert>
              <Button asChild className="w-full">
                <Link to="/auth/login">Return to login</Link>
              </Button>
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

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="relative isolate">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Verifying your email...</CardTitle>
            <CardDescription>Please wait while we verify your email address.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Spinner className="h-8 w-8" />
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

      <FieldDescription className="text-center text-xs">
        <Link to="/auth/login">Return to login</Link>
      </FieldDescription>
    </div>
  );
}
