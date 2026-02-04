import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, ArrowLeft, Plus } from "lucide-react";

export default function EditPostNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 rounded-none border-2 border-nb-border bg-nb-orange p-3 w-fit">
            <FileQuestion className="h-6 w-6 text-black" />
          </div>
          <CardTitle className="font-bold uppercase tracking-tight">Post not found</CardTitle>
          <CardDescription>
            This blog post doesn&apos;t exist or may have been deleted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="flex-1 nb-btn">
              <Link href="/admin/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Posts
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 nb-btn">
              <Link href="/admin/blog/new">
                <Plus className="mr-2 h-4 w-4" />
                Create New
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
