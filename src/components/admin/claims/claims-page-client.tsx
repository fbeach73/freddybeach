"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X, Clock, Building2, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { getCategoryById } from "@/lib/data/categories";
import { getClaimRoleLabel } from "@/lib/constants/claims";
import { formatDate } from "@/lib/utils/format";

// Claim type matching the database query result
interface Claim {
  id: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  businessCategoryId: string | null;
  userId: string;
  userName: string;
  userEmail: string;
  role: "owner" | "manager" | "authorized_representative";
  phone: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
}

interface ClaimsPageClientProps {
  claims: Claim[];
}

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

// formatDate helper for consistent date formatting in this component
function formatClaimDate(date: Date) {
  return formatDate(new Date(date), {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ClaimsPageClient({ claims }: ClaimsPageClientProps) {
  const router = useRouter();
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [isProcessing, setIsProcessing] = useState(false);

  // Track mounted state and cleanup abort controller
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Cancel any in-flight requests on unmount
      abortControllerRef.current?.abort();
    };
  }, []);

  // Approve dialog state
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [claimToApprove, setClaimToApprove] = useState<Claim | null>(null);

  // Reject dialog state
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [claimToReject, setClaimToReject] = useState<Claim | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Filter claims by status
  const pendingClaims = useMemo(() => claims.filter((c) => c.status === "pending"), [claims]);
  const approvedClaims = useMemo(() => claims.filter((c) => c.status === "approved"), [claims]);
  const rejectedClaims = useMemo(() => claims.filter((c) => c.status === "rejected"), [claims]);

  const getBusinessUrl = (claim: Claim) => {
    const category = claim.businessCategoryId
      ? getCategoryById(claim.businessCategoryId)
      : null;
    return category ? `/${category.slug}/${claim.businessSlug}` : null;
  };

  const handleApprove = async () => {
    if (!claimToApprove) return;

    // Cancel any previous request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/claims/${claimToApprove.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
        signal: abortControllerRef.current.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve claim");
      }

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) return;

      toast.success(data.message || "Claim approved successfully");
      setShowApproveDialog(false);
      setClaimToApprove(null);
      router.refresh();
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === "AbortError") return;
      if (!isMountedRef.current) return;
      toast.error(
        error instanceof Error ? error.message : "Failed to approve claim"
      );
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
      }
    }
  };

  const handleReject = async () => {
    if (!claimToReject) return;

    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    // Cancel any previous request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/claims/${claimToReject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          rejectionReason: rejectionReason.trim(),
        }),
        signal: abortControllerRef.current.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject claim");
      }

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) return;

      toast.success("Claim rejected");
      setShowRejectDialog(false);
      setClaimToReject(null);
      setRejectionReason("");
      router.refresh();
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === "AbortError") return;
      if (!isMountedRef.current) return;
      toast.error(
        error instanceof Error ? error.message : "Failed to reject claim"
      );
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
      }
    }
  };

  const openApproveDialog = (claim: Claim) => {
    setClaimToApprove(claim);
    setShowApproveDialog(true);
  };

  const openRejectDialog = (claim: Claim) => {
    setClaimToReject(claim);
    setRejectionReason("");
    setShowRejectDialog(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">Business Claims</h1>
        <p className="text-muted-foreground">
          Review and approve business claim requests. Approving a claim upgrades
          the user to Client role.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="nb-card bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-tight">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-nb-orange">
              {pendingClaims.length}
            </div>
          </CardContent>
        </Card>
        <Card className="nb-card bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-tight">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-nb-green">
              {approvedClaims.length}
            </div>
          </CardContent>
        </Card>
        <Card className="nb-card bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-tight">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-nb-pink">
              {rejectedClaims.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingClaims.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedClaims.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedClaims.length})
          </TabsTrigger>
          <TabsTrigger value="all">All ({claims.length})</TabsTrigger>
        </TabsList>

        {/* Pending Tab - Card Layout */}
        <TabsContent value="pending" className="space-y-4">
          {pendingClaims.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending claims to review.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  Claims Needing Review
                </CardTitle>
                <CardDescription>
                  Review each claim and approve or reject. Approving will
                  upgrade the user to Client role.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingClaims.map((claim) => {
                    const businessUrl = getBusinessUrl(claim);
                    return (
                      <div
                        key={claim.id}
                        className="flex flex-col md:flex-row md:items-start justify-between gap-4 p-4 border-2 border-nb-border/20"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <div className="flex h-10 w-10 items-center justify-center bg-nb-blue/20 border-2 border-nb-border text-nb-blue shrink-0">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="space-y-2 min-w-0">
                            <div>
                              {businessUrl ? (
                                <Link
                                  href={businessUrl}
                                  className="font-medium hover:underline"
                                  target="_blank"
                                >
                                  {claim.businessName}
                                </Link>
                              ) : (
                                <span className="font-medium">
                                  {claim.businessName}
                                </span>
                              )}
                              <Badge variant="secondary" className="ml-2">
                                {getClaimRoleLabel(claim.role)}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center gap-2">
                                <span>
                                  Claimed by{" "}
                                  <span className="font-bold text-foreground">
                                    {claim.userName}
                                  </span>
                                </span>
                              </div>
                              <div className="flex items-center gap-4 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {claim.userEmail}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {claim.phone}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm italic text-muted-foreground">
                              &quot;{claim.description}&quot;
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Submitted {formatClaimDate(claim.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => openRejectDialog(claim)}
                          >
                            <X className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openApproveDialog(claim)}
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Approved Tab - Table Layout */}
        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Claims</CardTitle>
              <CardDescription>
                History of approved business claims.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvedClaims.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">
                  No approved claims yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Approved</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedClaims.map((claim) => {
                      const businessUrl = getBusinessUrl(claim);
                      return (
                        <TableRow key={claim.id}>
                          <TableCell className="font-medium">
                            {businessUrl ? (
                              <Link
                                href={businessUrl}
                                className="hover:underline"
                                target="_blank"
                              >
                                {claim.businessName}
                              </Link>
                            ) : (
                              claim.businessName
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{claim.userName}</p>
                              <p className="text-sm text-muted-foreground">
                                {claim.userEmail}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{getClaimRoleLabel(claim.role)}</TableCell>
                          <TableCell>{formatClaimDate(claim.createdAt)}</TableCell>
                          <TableCell>
                            {claim.reviewedAt
                              ? formatClaimDate(claim.reviewedAt)
                              : "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rejected Tab - Table Layout */}
        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Claims</CardTitle>
              <CardDescription>
                History of rejected business claims.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rejectedClaims.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">
                  No rejected claims yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Rejected</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rejectedClaims.map((claim) => {
                      const businessUrl = getBusinessUrl(claim);
                      return (
                        <TableRow key={claim.id}>
                          <TableCell className="font-medium">
                            {businessUrl ? (
                              <Link
                                href={businessUrl}
                                className="hover:underline"
                                target="_blank"
                              >
                                {claim.businessName}
                              </Link>
                            ) : (
                              claim.businessName
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{claim.userName}</p>
                              <p className="text-sm text-muted-foreground">
                                {claim.userEmail}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{getClaimRoleLabel(claim.role)}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {claim.rejectionReason || "-"}
                          </TableCell>
                          <TableCell>
                            {claim.reviewedAt
                              ? formatClaimDate(claim.reviewedAt)
                              : "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Tab - Table Layout */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Claims</CardTitle>
              <CardDescription>Complete history of all claims.</CardDescription>
            </CardHeader>
            <CardContent>
              {claims.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">
                  No claims yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.map((claim) => {
                      const businessUrl = getBusinessUrl(claim);
                      return (
                        <TableRow key={claim.id}>
                          <TableCell className="font-medium">
                            {businessUrl ? (
                              <Link
                                href={businessUrl}
                                className="hover:underline"
                                target="_blank"
                              >
                                {claim.businessName}
                              </Link>
                            ) : (
                              claim.businessName
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{claim.userName}</p>
                              <p className="text-sm text-muted-foreground">
                                {claim.userEmail}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{getClaimRoleLabel(claim.role)}</TableCell>
                          <TableCell>{getStatusBadge(claim.status)}</TableCell>
                          <TableCell>{formatClaimDate(claim.createdAt)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Claim</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this claim?
              <br />
              <br />
              <strong>{claimToApprove?.userName}</strong> will become the owner
              of <strong>{claimToApprove?.businessName}</strong> and their
              account will be upgraded to Client role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={isProcessing}>
              {isProcessing ? "Approving..." : "Approve"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog with Reason Input */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Claim</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this claim. The user will be
              notified of this reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Business:</strong> {claimToReject?.businessName}
              </p>
              <p className="text-sm">
                <strong>Claimant:</strong> {claimToReject?.userName} (
                {claimToReject?.userEmail})
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason *</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Please explain why this claim is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing || !rejectionReason.trim()}
            >
              {isProcessing ? "Rejecting..." : "Reject Claim"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
