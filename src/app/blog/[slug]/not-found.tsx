import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";

export default function BlogPostNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="flex flex-col items-center text-center">
        <div className="rounded-full bg-muted p-6 mb-6">
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
        </div>

        <h1 className="text-3xl font-bold mb-2">Post Not Found</h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-md">
          Sorry, we couldn&apos;t find the blog post you&apos;re looking for. It may have been moved, renamed, or deleted.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild variant="default">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t w-full max-w-sm">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">
            Looking for something specific?
          </h2>
          <p className="text-sm text-muted-foreground">
            Try browsing our{" "}
            <Link href="/blog" className="text-primary hover:underline">
              latest posts
            </Link>{" "}
            or explore{" "}
            <Link href="/" className="text-primary hover:underline">
              local businesses
            </Link>{" "}
            in Fredericton.
          </p>
        </div>
      </div>
    </div>
  );
}
