import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "~/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

const preferencesSchema = z.object({
  language: z.string(),
  timezone: z.string(),
  theme: z.string(),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

export function PreferencesPage() {
  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      language: "en",
      timezone: "UTC",
      theme: "system",
    },
  });

  const onSubmit = (data: PreferencesFormData) => {
    console.log("Preferences update:", data);
    // TODO: Implement preferences update mutation
  };

  return (
    <div className="space-y-16 pb-16">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col gap-2 border-border border-b px-6 py-4">
          <h3 className="font-semibold text-lg">Appearance</h3>
          <p className="text-muted-foreground text-sm">Customize how the application looks and feels.</p>
        </div>
        <div className="space-y-4 px-6">
          <div className="max-w-xl space-y-4">
            <Controller
              control={form.control}
              name="theme"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="theme">Theme</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>Choose your preferred color theme.</FieldDescription>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="language"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="language">Language</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>Select your preferred language.</FieldDescription>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="timezone">Timezone</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>Select your local timezone.</FieldDescription>
                </Field>
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
