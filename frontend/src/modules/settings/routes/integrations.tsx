import { Github, Key, Mail, Slack, Webhook } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

export function IntegrationsPage() {
  const integrations = [
    {
      id: "github",
      name: "GitHub",
      description: "Connect your GitHub repositories to sync issues and pull requests.",
      icon: Github,
      connected: true,
      connectedAccount: "acme-inc",
    },
    {
      id: "slack",
      name: "Slack",
      description: "Receive notifications and updates in your Slack workspace.",
      icon: Slack,
      connected: false,
    },
    {
      id: "email",
      name: "Email",
      description: "Configure email integration for notifications and reports.",
      icon: Mail,
      connected: true,
      connectedAccount: "team@acme-inc.com",
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      <div className="space-y-6">
        <div className="flex flex-col gap-2 border-border border-b px-6 py-4">
          <h3 className="font-semibold text-lg">Available Integrations</h3>
          <p className="text-muted-foreground text-sm">Connect external services and tools to enhance your workflow.</p>
        </div>
        <div className="space-y-4 px-6">
          {integrations.map((integration, index) => {
            const Icon = integration.icon;
            return (
              <div key={integration.id}>
                {index > 0 && <Separator className="my-4" />}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{integration.name}</h4>
                        {integration.connected && (
                          <span className="rounded bg-green-50 px-2 py-0.5 text-green-600 text-xs dark:bg-green-950">
                            Connected
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-muted-foreground text-sm">{integration.description}</p>
                      {integration.connectedAccount && (
                        <p className="mt-2 text-muted-foreground text-xs">
                          Connected to: <span className="font-medium">{integration.connectedAccount}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {integration.connected ? (
                      <>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                        <Button variant="ghost" size="sm">
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button size="sm">Connect</Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-2 border-border border-b px-6 py-4">
          <h3 className="font-semibold text-lg">API Keys</h3>
          <p className="text-muted-foreground text-sm">Manage API keys for programmatic access to your organization.</p>
        </div>
        <div className="space-y-4 px-6">
          <div className="flex max-w-xl items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <p className="font-mono text-sm">sk_live_••••••••••••••••••••••••4567</p>
                <p className="mt-1 text-muted-foreground text-xs">Created on Jan 15, 2024</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              Revoke
            </Button>
          </div>
          <Button variant="outline">Create New API Key</Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-2 border-border border-y px-6 py-4">
          <h3 className="font-semibold text-lg">Webhooks</h3>
          <p className="text-muted-foreground text-sm">
            Configure webhooks to receive real-time notifications about events.
          </p>
        </div>
        <div className="space-y-4 px-6">
          <div className="flex max-w-xl flex-col items-center justify-center gap-3 rounded-lg border p-8 text-center">
            <Webhook className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              No webhooks configured yet. Create your first webhook to start receiving event notifications.
            </p>
          </div>
          <Button variant="outline">Add Webhook</Button>
        </div>
      </div>
    </div>
  );
}
