import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle2, Star, Building2, Eye } from "lucide-react";
import Link from "next/link";
import { businesses } from "@/lib/data";

function getStatusBadges(business: (typeof businesses)[0]) {
  const badges = [];

  if (business.isVerified) {
    badges.push(
      <Badge key="verified" variant="default" className="bg-green-600">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Verified
      </Badge>
    );
  }

  if (business.isFeatured) {
    badges.push(
      <Badge key="featured" variant="default" className="bg-amber-600">
        <Star className="mr-1 h-3 w-3" />
        Featured
      </Badge>
    );
  }

  if (business.isClaimed) {
    badges.push(
      <Badge key="claimed" variant="outline">
        Claimed
      </Badge>
    );
  }

  return badges;
}

function getTierBadge(tier: string) {
  switch (tier) {
    case "featured":
      return <Badge className="bg-amber-600">Featured</Badge>;
    case "enhanced":
      return <Badge variant="default">Enhanced</Badge>;
    default:
      return <Badge variant="secondary">Free</Badge>;
  }
}

export default function BusinessesPage() {
  const verifiedCount = businesses.filter((b) => b.isVerified).length;
  const featuredCount = businesses.filter((b) => b.isFeatured).length;
  const claimedCount = businesses.filter((b) => b.isClaimed).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Business Management</h1>
        <p className="text-muted-foreground">
          View all businesses, verify listings, and manage featured status.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businesses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{verifiedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{featuredCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Claimed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claimedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Businesses</CardTitle>
          <CardDescription>
            Manage business listings, verification status, and featured placement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {businesses.map((business) => (
                <TableRow key={business.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <Link
                          href={`/${business.categorySlug}/${business.slug}`}
                          className="font-medium hover:underline"
                        >
                          {business.name}
                        </Link>
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {business.address}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">
                    {business.categorySlug.replace("-", " ")}
                  </TableCell>
                  <TableCell>{getTierBadge(business.tier)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {getStatusBadges(business)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span>{business.rating.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/${business.categorySlug}/${business.slug}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View public page
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit business</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          {business.isVerified ? "Remove verification" : "Mark as verified"}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {business.isFeatured ? "Remove from featured" : "Add to featured"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Delete business
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
