import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ConsultationCTACard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <Lightbulb className="h-5 w-5" />
          <span className="font-semibold">Need Custom Solutions?</span>
        </div>

        <h3 className="mt-3 text-lg font-semibold">
          Get personalized AI strategy
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Book a free consultation with our AI experts to discover how we can
          help automate your business operations.
        </p>

        <Button variant="outline" className="mt-6 w-full" asChild>
          <Link href="/consultation">Book Free AI Audit</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
