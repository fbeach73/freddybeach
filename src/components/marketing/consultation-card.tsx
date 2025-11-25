"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ConsultationPackage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, Clock, Target } from "lucide-react";
import Link from "next/link";

interface ConsultationCardProps {
  package_: ConsultationPackage;
  className?: string;
}

export function ConsultationCard({
  package_,
  className,
}: ConsultationCardProps) {
  const isPopular = package_.isPopular;

  return (
    <Card
      className={cn(
        "relative flex flex-col",
        isPopular && "border-primary shadow-lg ring-2 ring-primary/20",
        className
      )}
    >
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Most Popular
        </Badge>
      )}

      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl">{package_.name}</CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {package_.timeline}
          </Badge>
        </div>

        <div>
          <span className="text-4xl font-bold">{package_.priceLabel}</span>
        </div>

        <CardDescription className="text-base">
          {package_.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-6">
        <div>
          <h4 className="mb-3 flex items-center gap-2 font-semibold">
            <Check className="h-4 w-4 text-primary" />
            What&apos;s Included
          </h4>
          <ul className="space-y-2">
            {package_.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 flex items-center gap-2 font-semibold">
            <Target className="h-4 w-4 text-primary" />
            Expected Outcomes
          </h4>
          <ul className="space-y-2">
            {package_.outcomes.map((outcome, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                <span className="text-sm text-muted-foreground">{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          asChild
          className="w-full"
          variant={isPopular ? "default" : "outline"}
          size="lg"
        >
          <Link href={`/consultation#booking`}>Book Consultation</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
