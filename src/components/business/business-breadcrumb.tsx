import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BusinessBreadcrumbProps {
  categoryName: string;
  categorySlug: string;
  businessName: string;
}

export function BusinessBreadcrumb({
  categoryName,
  categorySlug,
  businessName,
}: BusinessBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="font-bold">
        <BreadcrumbItem>
          <BreadcrumbLink asChild className="hover:text-nb-yellow transition-colors">
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="text-nb-border font-black [&>svg]:size-4" />
        <BreadcrumbItem>
          <BreadcrumbLink asChild className="hover:text-nb-yellow transition-colors">
            <Link href={`/${categorySlug}`}>{categoryName}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="text-nb-border font-black [&>svg]:size-4" />
        <BreadcrumbItem>
          <BreadcrumbPage className="font-black text-nb-yellow">{businessName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
