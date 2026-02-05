import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Freddy Beach Blog",
    default: "Blog | Freddy Beach",
  },
  description:
    "The Freddy Beach Blog covers local insights, business spotlights, and community stories from Fredericton, NB. Stay connected with everything happening in Freddy Beach.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="min-h-screen">{children}</main>;
}
