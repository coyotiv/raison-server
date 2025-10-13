import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from "react-router";
import { AppLayout } from "~/layouts/app-layout";
import { BrandedLayout } from "~/layouts/branded-layout";
import { queryClient } from "~/lib/query-client";
import { ForgotPasswordPage } from "~/modules/auth/routes/forgot-password.route";
import { LoginPage } from "~/modules/auth/routes/login.route";
import { RegisterPage } from "~/modules/auth/routes/register.route";
import { ResetPasswordPage } from "~/modules/auth/routes/reset-password.route";
import { VerifyEmailPage } from "~/modules/auth/routes/verify-email.route";
import { OnboardingMembersPage } from "~/modules/onboarding/routes/members";
import { OnboardingOrganizationPage } from "~/modules/onboarding/routes/organization";
import { AuthProvider } from "~/providers/auth-provider";

const AuthProviderWrapper = () => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
};

const router = createBrowserRouter([
  {
    path: "",
    element: <AuthProviderWrapper />,
    children: [
      {
        path: "auth",
        element: <BrandedLayout />,
        children: [
          { path: "", element: <Navigate to="login" replace /> },
          { path: "login", element: <LoginPage /> },
          { path: "register", element: <RegisterPage /> },
          { path: "forgot-password", element: <ForgotPasswordPage /> },
          { path: "reset-password", element: <ResetPasswordPage /> },
          { path: "verify-email", element: <VerifyEmailPage /> },
          { path: "*", element: <Navigate to="/auth/login" replace /> },
        ],
      },

      {
        path: "onboarding",
        element: <BrandedLayout />,
        children: [
          { path: "", element: <Navigate to="organization" replace /> },
          { path: "organization", element: <OnboardingOrganizationPage /> },
          { path: "invite-members", element: <OnboardingMembersPage /> },
          { path: "*", element: <Navigate to="/" replace /> },
        ],
      },

      {
        path: "",
        element: <AppLayout />,
        children: [
          { path: "", element: <div>Home</div> },
          { path: "settings", element: <div>Settings</div> },
          { path: "agents", element: <div>Agents</div> },
        ],
      },

      { path: "*", element: <div>404 Not Found</div> },
    ],
  },
]);

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
