import { ArrowLeft, GitBranch, Network, Shield, Users, Workflow } from "lucide-react";
import { Outlet, useLocation } from "react-router";
import { Raison } from "~/components/icons/raison";
import { Button } from "~/components/ui/button";
import { useLogoutMutation } from "~/modules/auth/hooks";

export const BrandedLayout = () => {
  const location = useLocation();
  const logoutMutation = useLogoutMutation();
  const isOnboardingPage = location.pathname.startsWith("/onboarding");

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left side - Information about Raison */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 px-16 py-12 pb-8 text-white lg:flex xl:px-24">
        {/* Background decoration */}
        {/*<div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />*/}
        <div className="absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-red-500/20 via-purple-500/20 to-blue-500/20 blur-3xl" />
        <div className="absolute top-0 left-0 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-yellow-500/10 via-green-500/10 to-blue-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-1 flex-col justify-center gap-12">
          {/* Logo and tagline */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Raison className="h-10 w-10" />
              <span className="font-bold text-2xl tracking-tight">Raison</span>
            </div>
            <div className="flex flex-col gap-4">
              <h1 className="font-bold text-5xl leading-tight">
                Version, Govern,
                <br />
                and{" "}
                <span className="bg-gradient-to-r from-red-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Ship Prompts
                </span>
              </h1>
              <p className="text-lg text-zinc-400">
                Ship prompt changes safely. Track every version.
                <br />
                Roll back instantly when things break.
              </p>
            </div>
          </div>

          {/* Key features */}
          <div className="mb-8 flex flex-col gap-8">
            <div className="flex items-center gap-2 font-medium text-sm text-zinc-500 uppercase tracking-wider">
              <span>Built for Production AI Systems</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-700" />
            </div>

            <div className="grid gap-8">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <GitBranch className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold">Version Control & Rollback</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Track every prompt change with diffs, releases, and tags. Roll back instantly when things break.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <Workflow className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold">Environments & Schemas</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Dev, staging, prod environments. Typed variables with validation. No more broken prompts.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold">Approval Workflows</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Review prompt changes before they ship. Audit logs show who changed what and when.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <Network className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Visual Prompt Builder</h3>
                    <span className="rounded-full border border-zinc-700 bg-zinc-800/50 px-2 py-0.5 text-xs text-zinc-400">
                      powered by <span className="font-bold text-white">BRAID</span>
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Build decision trees with conditional logic. Drag and drop prompt components with branching paths.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold">Team Collaboration</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    RBAC, spaces, and projects. Product, ML, and engineering work together without conflicts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="relative z-10 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <p>© 2025 Raison</p>
            <span>·</span>
            <p>
              Built by{" "}
              <a
                href="https://coyotiv.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-zinc-200 transition-colors hover:text-zinc-300"
              >
                Coyotiv
              </a>
            </p>
          </div>
          <div className="flex gap-2">
            <a href="/terms-of-service" className="transition-colors hover:text-zinc-200">
              Terms of Service
            </a>
            <span>·</span>
            <a href="/privacy-policy" className="transition-colors hover:text-zinc-200">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>

      {/* Right side - Form content */}
      <div className="relative flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-6 md:p-10">
        {isOnboardingPage && (
          <div className="absolute top-6 left-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <ArrowLeft className="h-4 w-4" />
              Switch account
            </Button>
          </div>
        )}
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
