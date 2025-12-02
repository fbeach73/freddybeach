import type { Metadata } from "next";
import { GalleryClient } from "./gallery-client";

export const metadata: Metadata = {
  title: "Community Gallery | FreddyBeach Directory",
  description:
    "Explore AI-generated images created by the FreddyBeach community. Get inspired and share your own creations.",
  openGraph: {
    title: "Community Gallery | FreddyBeach Directory",
    description:
      "Explore AI-generated images created by the FreddyBeach community.",
  },
};

export default function GalleryPage() {
  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Community Gallery
            </h1>
            <p className="text-muted-foreground md:text-lg">
              Explore AI-generated images created by the community. Get inspired
              and share your own creations.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Content */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <GalleryClient />
        </div>
      </section>
    </div>
  );
}
