import { Clock, Bell } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ComingSoonProps {
  title: string;
  description: string;
  features?: string[];
  showNotify?: boolean;
}

export function ComingSoon({
  title,
  description,
  features,
  showNotify = true,
}: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center bg-nb-orange/20 border-2 border-nb-border">
        <Clock className="h-8 w-8 text-nb-orange" />
      </div>

      <h2 className="mt-6 text-2xl font-bold uppercase tracking-tight">{title}</h2>
      <p className="mt-2 max-w-md text-muted-foreground">{description}</p>

      {features && features.length > 0 && (
        <div className="nb-card bg-card mt-6 w-full max-w-md">
          <div className="h-2 bg-nb-orange border-b-2 border-nb-border" />
          <CardContent className="p-6">
            <h3 className="font-bold text-left uppercase tracking-tight">Coming Features:</h3>
            <ul className="mt-3 space-y-2 text-left">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <div className="h-2 w-2 bg-nb-orange border border-nb-border" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </div>
      )}

      {showNotify && (
        <div className="mt-6 flex w-full max-w-sm gap-2">
          <Input placeholder="Enter your email" type="email" />
          <Button>
            <Bell className="mr-2 h-4 w-4" />
            Notify Me
          </Button>
        </div>
      )}
    </div>
  );
}
