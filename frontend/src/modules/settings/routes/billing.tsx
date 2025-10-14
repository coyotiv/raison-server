import { Check, CreditCard } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

export function BillingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: ["Up to 3 members", "5 GB storage", "Basic support", "Community access"],
      current: true,
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      features: ["Up to 25 members", "100 GB storage", "Priority support", "Advanced analytics"],
      current: false,
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "per month",
      features: ["Unlimited members", "Unlimited storage", "24/7 support", "Dedicated account manager"],
      current: false,
    },
  ];

  const billingHistory = [
    { id: "1", date: "2024-03-01", amount: "$29.00", status: "Paid", invoice: "INV-2024-03-001" },
    { id: "2", date: "2024-02-01", amount: "$29.00", status: "Paid", invoice: "INV-2024-02-001" },
    { id: "3", date: "2024-01-01", amount: "$29.00", status: "Paid", invoice: "INV-2024-01-001" },
  ];

  return (
    <div className="space-y-16 pb-16">
      <div className="space-y-6">
        <div className="flex flex-col gap-2 border-border border-b px-6 py-4">
          <h3 className="font-semibold text-lg">Current Plan</h3>
          <p className="text-muted-foreground text-sm">Manage your subscription and billing.</p>
        </div>
        <div className="space-y-4 px-6">
          <div className="flex max-w-xl items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Free Plan</p>
              <p className="text-muted-foreground text-sm">$0 per month</p>
            </div>
            <Button variant="outline">Upgrade Plan</Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-2 border-border border-b px-6 py-4">
          <h3 className="font-semibold text-lg">Available Plans</h3>
          <p className="text-muted-foreground text-sm">Choose the plan that best fits your needs.</p>
        </div>
        <div className="px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`space-y-4 rounded-lg border p-6 ${plan.current ? "border-primary" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{plan.name}</h4>
                  {plan.current && (
                    <span className="rounded bg-primary/10 px-2 py-1 text-primary text-xs">Current</span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-3xl">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">/{plan.period}</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.current ? "outline" : "default"} disabled={plan.current}>
                  {plan.current ? "Current Plan" : "Upgrade"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-2 border-border border-y px-6 py-4">
          <h3 className="font-semibold text-lg">Payment Method</h3>
          <p className="text-muted-foreground text-sm">Manage your payment methods.</p>
        </div>
        <div className="px-6">
          <div className="flex max-w-xl items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">•••• •••• •••• 4242</p>
                <p className="text-muted-foreground text-xs">Expires 12/2025</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-2 border-border border-y px-6 py-4">
          <h3 className="font-semibold text-lg">Billing History</h3>
          <p className="text-muted-foreground text-sm">View your past invoices and payments.</p>
        </div>
        <div className="space-y-4 px-6">
          {billingHistory.map((item, index) => (
            <div key={item.id}>
              {index > 0 && <Separator className="my-4" />}
              <div className="flex max-w-xl items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{item.invoice}</p>
                  <p className="text-muted-foreground text-xs">{item.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-sm">{item.amount}</span>
                  <span className="rounded bg-green-50 px-2 py-1 text-green-600 text-xs dark:bg-green-950">
                    {item.status}
                  </span>
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
