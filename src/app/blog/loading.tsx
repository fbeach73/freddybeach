import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

function BlogCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Featured Image Skeleton */}
      <Skeleton className="aspect-video w-full rounded-none" />

      <CardContent className="p-4">
        {/* Title Skeleton */}
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-6 w-1/2 mb-3" />

        {/* Excerpt Skeleton */}
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-4/5" />
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between">
        {/* Date Skeleton */}
        <Skeleton className="h-3 w-24" />
        {/* Reading Time Skeleton */}
        <Skeleton className="h-3 w-16" />
      </CardFooter>
    </Card>
  );
}

export default function BlogLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Page Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-6 w-96" />
      </div>

      {/* Blog Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <BlogCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
