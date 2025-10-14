import type React from "react";
import { Link, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { FieldDescription } from "~/components/ui/field";
import { cn } from "~/lib/utils";

export function CheckEmailForm({ className, ...props }: React.ComponentProps<"div">) {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="relative isolate">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Check your email</CardTitle>
            <CardDescription>
              {email ? (
                <>
                  We've sent a verification link to <strong>{email}</strong>
                </>
              ) : (
                "We've sent a verification link to your email address"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 text-center text-muted-foreground text-sm">
              <p>Please click the verification link in the email to activate your account.</p>
              <p>If you don't see the email, check your spam folder.</p>
            </div>

            <div className="flex gap-2">
              <Button asChild className="w-full" variant="outline">
                <Link to="/auth/login">Return to login</Link>
              </Button>
            </div>
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
        Didn't receive the email? Check your spam folder or contact support.
      </FieldDescription>
    </div>
  );
}
