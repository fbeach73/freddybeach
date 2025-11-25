import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClaimBusinessCtaProps {
  businessName: string;
  className?: string;
}

export function ClaimBusinessCta({ businessName, className }: ClaimBusinessCtaProps) {
  const benefits = [
    "Respond to customer reviews",
    "Update business information",
    "Add photos and special offers",
    "Access business analytics",
  ];

  return (
    <Card className={cn("border-2 border-dashed border-primary/30 bg-primary/5", className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg">Is this your business?</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Claim <span className="font-medium text-foreground">{businessName}</span> to manage your listing and unlock these benefits:
        </p>
        <ul className="space-y-2">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
        <Button className="w-full" size="lg">
          Claim This Business
        </Button>
      </CardContent>
    </Card>
  );
}
