import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Building2, Star, TrendingUp, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/auth-dialog";

export const metadata = {
  title: "Add Your Business | FreddyBeach Directory",
  description:
    "List your Fredericton business on FreddyBeach Directory. Reach local customers, collect reviews, and grow your online presence.",
};

const benefits = [
  {
    icon: Users,
    title: "Reach Local Customers",
    description:
      "Get discovered by people searching for businesses in Fredericton.",
  },
  {
    icon: Star,
    title: "Collect Reviews",
    description:
      "Build trust with customer reviews and ratings on your listing.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Presence",
    description:
      "Improve your online visibility with a dedicated business profile.",
  },
  {
    icon: CheckCircle,
    title: "Free to List",
    description:
      "Adding your business is completely free. Get started in minutes.",
  },
];

export default async function AddBusinessPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard/my-businesses/new");
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Add Your Business to FreddyBeach
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Join Fredericton&apos;s local business directory and connect with
          customers in your community.
        </p>

        <div className="mt-12 grid gap-6 text-left sm:grid-cols-2">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex gap-4 rounded-lg border p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <benefit.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{benefit.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-lg border bg-muted/30 p-8">
          <h2 className="text-xl font-semibold">
            Sign in to get started
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a free account or sign in to add your business listing.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <AuthDialog defaultTab="sign-up">
              <Button size="lg">Create Account</Button>
            </AuthDialog>
            <AuthDialog defaultTab="sign-in">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </AuthDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
