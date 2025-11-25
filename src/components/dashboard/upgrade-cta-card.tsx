import Link from "next/link";
import { Sparkles, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  "Unlimited AI tool generations",
  "Premium business description writer",
  "Priority email template generator",
  "Analytics dashboard access",
];

export function UpgradeCTACard() {
  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold">Upgrade to Enhanced</span>
        </div>

        <h3 className="mt-3 text-lg font-semibold">
          Unlock the full power of AI tools
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Get unlimited access to all AI tools and premium features.
        </p>

        <ul className="mt-4 space-y-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              {feature}
            </li>
          ))}
        </ul>

        <Button className="mt-6 w-full" asChild>
          <Link href="/ai-tools#pricing">Upgrade Now</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
