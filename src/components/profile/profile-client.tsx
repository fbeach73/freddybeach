"use client";

import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Mail, Calendar, User, Shield, ArrowLeft, Trash2, Monitor, Smartphone, LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient, signOut } from "@/lib/auth-client";

interface ProfileClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

interface Session {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter();

  // Edit Profile state
  const [editName, setEditName] = useState(user.name);
  const [editImage, setEditImage] = useState(user.image || "");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sessions state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);

  // Email preferences state
  const [emailMarketing, setEmailMarketing] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [emailSecurity, setEmailSecurity] = useState(true);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  // Delete account state
  const [isDeleting, setIsDeleting] = useState(false);

  const createdDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : null;

  // Update profile handler
  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      const { error } = await authClient.updateUser({
        name: editName,
        image: editImage || undefined,
      });

      if (error) {
        console.error("Failed to update profile:", error);
        alert("Failed to update profile. Please try again.");
      } else {
        setIsEditOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Load sessions handler
  const handleLoadSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const { data, error } = await authClient.listSessions();
      if (error) {
        console.error("Failed to load sessions:", error);
      } else if (data) {
        setSessions(data as Session[]);
      }
    } catch (err) {
      console.error("Error loading sessions:", err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Revoke session handler
  const handleRevokeSession = async (token: string, sessionId: string) => {
    setRevokingSessionId(sessionId);
    try {
      const { error } = await authClient.revokeSession({ token });
      if (error) {
        console.error("Failed to revoke session:", error);
        alert("Failed to revoke session. Please try again.");
      } else {
        setSessions(sessions.filter(s => s.id !== sessionId));
      }
    } catch (err) {
      console.error("Error revoking session:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setRevokingSessionId(null);
    }
  };

  // Revoke all other sessions handler
  const handleRevokeOtherSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const { error } = await authClient.revokeOtherSessions();
      if (error) {
        console.error("Failed to revoke sessions:", error);
        alert("Failed to revoke sessions. Please try again.");
      } else {
        await handleLoadSessions();
      }
    } catch (err) {
      console.error("Error revoking sessions:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Save email preferences handler
  const handleSaveEmailPrefs = async () => {
    setIsSavingPrefs(true);
    // Simulate saving - in a real app, you'd save to database
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSavingPrefs(false);
    setIsEmailOpen(false);
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { error } = await authClient.deleteUser();
      if (error) {
        console.error("Failed to delete account:", error);
        alert("Failed to delete account. You may need to sign in again recently to delete your account.");
      } else {
        await signOut();
        router.replace("/");
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Parse user agent to get device info
  const getDeviceInfo = (userAgent?: string | null) => {
    if (!userAgent) return { type: "Unknown", name: "Unknown device" };

    const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
    const browser = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)/i)?.[0] || "Browser";
    const os = userAgent.match(/(Windows|Mac|Linux|Android|iOS)/i)?.[0] || "Unknown OS";

    return {
      type: isMobile ? "mobile" : "desktop",
      name: `${browser} on ${os}`,
    };
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Your Profile</h1>
      </div>

      <div className="grid gap-6">
        {/* Profile Overview Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={user.image || ""}
                  alt={user.name || "User"}
                  referrerPolicy="no-referrer"
                />
                <AvatarFallback className="text-lg">
                  {(
                    user.name?.[0] ||
                    user.email?.[0] ||
                    "U"
                  ).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">{user.name}</h2>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                  {user.emailVerified && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                {createdDate && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Member since {createdDate}</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your account details and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Full Name
                </label>
                <div className="p-3 border rounded-md bg-muted/10">
                  {user.name || "Not provided"}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Email Address
                </label>
                <div className="p-3 border rounded-md bg-muted/10 flex items-center justify-between">
                  <span>{user.email}</span>
                  {user.emailVerified && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Account Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Email Verification</p>
                    <p className="text-sm text-muted-foreground">
                      Email address verification status
                    </p>
                  </div>
                  <Badge variant={user.emailVerified ? "default" : "secondary"}>
                    {user.emailVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Account Type</p>
                    <p className="text-sm text-muted-foreground">
                      Your account access level
                    </p>
                  </div>
                  <Badge variant="outline">Standard</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your account settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Edit Profile Dialog */}
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <User className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">Edit Profile</div>
                      <div className="text-xs text-muted-foreground">Update your information</div>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Update your profile information below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="image">Profile Image URL</Label>
                      <Input
                        id="image"
                        value={editImage}
                        onChange={(e) => setEditImage(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter a URL to your profile image
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateProfile} disabled={isUpdating}>
                      {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Security Settings Dialog */}
              <Dialog open={isSecurityOpen} onOpenChange={(open) => {
                setIsSecurityOpen(open);
                if (open) handleLoadSessions();
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <Shield className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">Security Settings</div>
                      <div className="text-xs text-muted-foreground">Manage security options</div>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Security Settings</DialogTitle>
                    <DialogDescription>
                      Manage your active sessions and security preferences.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Active Sessions</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRevokeOtherSessions}
                        disabled={isLoadingSessions || sessions.length <= 1}
                      >
                        Sign out other devices
                      </Button>
                    </div>

                    {isLoadingSessions ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : sessions.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No active sessions found.
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {sessions.map((session) => {
                          const device = getDeviceInfo(session.userAgent);
                          const isCurrentSession = new Date(session.updatedAt).getTime() > Date.now() - 60000;

                          return (
                            <div
                              key={session.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                {device.type === "mobile" ? (
                                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                  <Monitor className="h-5 w-5 text-muted-foreground" />
                                )}
                                <div>
                                  <p className="font-medium text-sm">
                                    {device.name}
                                    {isCurrentSession && (
                                      <Badge variant="outline" className="ml-2 text-green-600 border-green-600">
                                        Current
                                      </Badge>
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {session.ipAddress || "Unknown IP"} - Last active{" "}
                                    {new Date(session.updatedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              {!isCurrentSession && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRevokeSession(session.token, session.id)}
                                  disabled={revokingSessionId === session.id}
                                >
                                  {revokingSessionId === session.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <LogOut className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsSecurityOpen(false)}>
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Email Preferences Dialog */}
              <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <Mail className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">Email Preferences</div>
                      <div className="text-xs text-muted-foreground">Configure notifications</div>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Email Preferences</DialogTitle>
                    <DialogDescription>
                      Choose which emails you want to receive.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Marketing Emails</Label>
                        <p className="text-xs text-muted-foreground">
                          Receive emails about new features and offers
                        </p>
                      </div>
                      <Switch
                        checked={emailMarketing}
                        onCheckedChange={setEmailMarketing}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Product Updates</Label>
                        <p className="text-xs text-muted-foreground">
                          Receive emails about product updates
                        </p>
                      </div>
                      <Switch
                        checked={emailUpdates}
                        onCheckedChange={setEmailUpdates}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Security Alerts</Label>
                        <p className="text-xs text-muted-foreground">
                          Receive emails about security events
                        </p>
                      </div>
                      <Switch
                        checked={emailSecurity}
                        onCheckedChange={setEmailSecurity}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEmailOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveEmailPrefs} disabled={isSavingPrefs}>
                      {isSavingPrefs && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Preferences
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg bg-destructive/5">
              <div className="space-y-1">
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isDeleting}
                    >
                      {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
