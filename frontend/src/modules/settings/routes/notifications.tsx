import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { FieldDescription, FieldLabel } from "~/components/ui/field";
import { Separator } from "~/components/ui/separator";

type NotificationsFormData = {
  emailNotifications: boolean;
  agentUpdates: boolean;
  experimentResults: boolean;
  organizationActivity: boolean;
  securityAlerts: boolean;
};

export function NotificationsPage() {
  const form = useForm<NotificationsFormData>({
    defaultValues: {
      emailNotifications: true,
      agentUpdates: true,
      experimentResults: true,
      organizationActivity: false,
      securityAlerts: true,
    },
  });

  const onSubmit = (data: NotificationsFormData) => {
    console.log("Notifications update:", data);
    // TODO: Implement notifications update mutation
  };

  return (
    <div className="space-y-16 pb-16">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col gap-2 border-border border-b px-6 py-4">
          <h3 className="font-semibold text-lg">Notification Preferences</h3>
          <p className="text-muted-foreground text-sm">Choose how and when you want to be notified.</p>
        </div>
        <div className="space-y-4 px-6">
          <div className="max-w-xl space-y-6">
            <Controller
              control={form.control}
              name="emailNotifications"
              render={({ field }) => (
                <div className="flex items-start space-x-3">
                  <Checkbox id="emailNotifications" checked={field.value} onCheckedChange={field.onChange} />
                  <div className="space-y-1">
                    <FieldLabel htmlFor="emailNotifications" className="cursor-pointer">
                      Email Notifications
                    </FieldLabel>
                    <FieldDescription>
                      Receive email notifications for important updates and activities.
                    </FieldDescription>
                  </div>
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="agentUpdates"
              render={({ field }) => (
                <div className="flex items-start space-x-3">
                  <Checkbox id="agentUpdates" checked={field.value} onCheckedChange={field.onChange} />
                  <div className="space-y-1">
                    <FieldLabel htmlFor="agentUpdates" className="cursor-pointer">
                      Agent Updates
                    </FieldLabel>
                    <FieldDescription>Get notified when agents are updated or modified.</FieldDescription>
                  </div>
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="experimentResults"
              render={({ field }) => (
                <div className="flex items-start space-x-3">
                  <Checkbox id="experimentResults" checked={field.value} onCheckedChange={field.onChange} />
                  <div className="space-y-1">
                    <FieldLabel htmlFor="experimentResults" className="cursor-pointer">
                      Experiment Results
                    </FieldLabel>
                    <FieldDescription>Get notified when experiments complete or have new results.</FieldDescription>
                  </div>
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="organizationActivity"
              render={({ field }) => (
                <div className="flex items-start space-x-3">
                  <Checkbox id="organizationActivity" checked={field.value} onCheckedChange={field.onChange} />
                  <div className="space-y-1">
                    <FieldLabel htmlFor="organizationActivity" className="cursor-pointer">
                      Organization Activity
                    </FieldLabel>
                    <FieldDescription>
                      Get notified about important organization activities and changes.
                    </FieldDescription>
                  </div>
                </div>
              )}
            />

            <Separator />

            <Controller
              control={form.control}
              name="securityAlerts"
              render={({ field }) => (
                <div className="flex items-start space-x-3">
                  <Checkbox id="securityAlerts" checked={field.value} onCheckedChange={field.onChange} disabled />
                  <div className="space-y-1">
                    <FieldLabel htmlFor="securityAlerts" className="cursor-pointer">
                      Security Alerts
                    </FieldLabel>
                    <FieldDescription>Critical security notifications (cannot be disabled).</FieldDescription>
                  </div>
                </div>
              )}
            />
          </div>

          <div className="flex justify-start">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
              Save preferences
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
