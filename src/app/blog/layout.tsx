import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | FreddyBeach Blog",
    default: "Blog | FreddyBeach",
  },
  description:
    "Discover local insights, business spotlights, and community stories from Fredericton. The FreddyBeach Blog brings you the best of Freddy Beach.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="min-h-screen">{children}</main>;
}
