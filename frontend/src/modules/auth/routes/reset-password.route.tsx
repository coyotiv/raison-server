import { Link, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ResetPasswordForm } from "~/modules/auth/components/reset-password-form";

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  if (!token) {
    return (
      <div className="max-w-sm flex-1">
        <div className="relative isolate">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Invalid Reset Link</CardTitle>
              <CardDescription>
                The password reset link is invalid or has expired. Please request a new one.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/auth/forgot-password">Request new link</Link>
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
    <div className="max-w-sm flex-1">
      <ResetPasswordForm token={token} />
    </div>
  );
};
