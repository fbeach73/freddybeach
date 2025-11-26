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
import { Check, X, Clock, Building2 } from "lucide-react";
import Link from "next/link";

// Mock claims data - replace with real database queries
const mockClaims = [
  {
    id: "1",
    businessName: "Read's Beans Coffee",
    businessSlug: "reads-beans-coffee",
    userName: "John Smith",
    userEmail: "john@example.com",
    status: "pending",
    submittedAt: new Date("2024-11-20"),
    notes: "I am the owner of this coffee shop since 2019.",
  },
  {
    id: "2",
    businessName: "Sweet Willow Bakery",
    businessSlug: "sweet-willow-bakery",
    userName: "Jane Doe",
    userEmail: "jane@example.com",
    status: "pending",
    submittedAt: new Date("2024-11-22"),
    notes: "This is my family bakery.",
  },
  {
    id: "3",
    businessName: "Maritime Grill",
    businessSlug: "maritime-grill",
    userName: "Sarah Mitchell",
    userEmail: "sarah@example.com",
    status: "approved",
    submittedAt: new Date("2024-11-15"),
    approvedAt: new Date("2024-11-16"),
    notes: "Manager of the restaurant.",
  },
  {
    id: "4",
    businessName: "Harbour View Inn",
    businessSlug: "harbour-view-inn",
    userName: "Michael Brown",
    userEmail: "michael@example.com",
    status: "rejected",
    submittedAt: new Date("2024-11-10"),
    rejectedAt: new Date("2024-11-12"),
    rejectionReason: "Could not verify ownership.",
    notes: "I work here.",
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="text-amber-600 border-amber-600">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
    case "approved":
      return (
        <Badge variant="default" className="bg-green-600">
          <Check className="mr-1 h-3 w-3" />
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="destructive">
          <X className="mr-1 h-3 w-3" />
          Rejected
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function ClaimsPage() {
  const pendingClaims = mockClaims.filter((c) => c.status === "pending");
  const processedClaims = mockClaims.filter((c) => c.status !== "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Business Claims</h1>
        <p className="text-muted-foreground">
          Review and approve business claim requests. Approving a claim upgrades the user to Client role.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingClaims.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockClaims.filter((c) => c.status === "approved").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {mockClaims.filter((c) => c.status === "rejected").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {pendingClaims.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              Pending Claims
            </CardTitle>
            <CardDescription>
              These claims need your review. Approving will upgrade the user to Client role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <Link
                        href={`/restaurants/${claim.businessSlug}`}
                        className="font-medium hover:underline"
                      >
                        {claim.businessName}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Claimed by {claim.userName} ({claim.userEmail})
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        &quot;{claim.notes}&quot;
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted {claim.submittedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 md:flex-shrink-0">
                    <Button size="sm" variant="outline" className="text-destructive">
                      <X className="mr-1 h-4 w-4" />
                      Reject
                    </Button>
                    <Button size="sm">
                      <Check className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Processed Claims</CardTitle>
          <CardDescription>History of all processed claim requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedClaims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium">{claim.businessName}</TableCell>
                  <TableCell>
                    <div>
                      <p>{claim.userName}</p>
                      <p className="text-sm text-muted-foreground">{claim.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(claim.status)}</TableCell>
                  <TableCell>
                    {claim.submittedAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
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
