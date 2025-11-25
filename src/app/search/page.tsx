import { Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function SearchPage() {
  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <PageHeader
        title="Search Businesses"
        description="Find local businesses in Fredericton"
      />
      <div className="mt-8">
        <EmptyState
          icon={Search}
          title="Search Coming Soon"
          description="Full search functionality is being built. Check back soon to search for local businesses, services, and more."
          action={{
            label: "Browse Categories",
            href: "/",
          }}
        />
      </div>
    </main>
  );
}
