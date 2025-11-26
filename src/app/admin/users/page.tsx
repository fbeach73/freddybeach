import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { MoreHorizontal, Shield, User, Building2 } from "lucide-react";

// Mock users - replace with real data from database
const mockUsers = [
  {
    id: "1",
    name: "Kyle Sweezey",
    email: "admin@freddybeach.com",
    role: "admin",
    image: null,
    createdAt: new Date("2024-01-15"),
    businessCount: 0,
  },
  {
    id: "2",
    name: "Sarah Mitchell",
    email: "sarah@example.com",
    role: "client",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    createdAt: new Date("2024-03-20"),
    businessCount: 2,
  },
  {
    id: "3",
    name: "John Smith",
    email: "john@example.com",
    role: "user",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    createdAt: new Date("2024-04-10"),
    businessCount: 0,
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@example.com",
    role: "client",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    createdAt: new Date("2024-05-05"),
    businessCount: 1,
  },
  {
    id: "5",
    name: "Michael Brown",
    email: "michael@example.com",
    role: "user",
    image: null,
    createdAt: new Date("2024-06-15"),
    businessCount: 0,
  },
];

function getRoleBadge(role: string) {
  switch (role) {
    case "admin":
      return <Badge variant="destructive"><Shield className="mr-1 h-3 w-3" />Admin</Badge>;
    case "client":
      return <Badge variant="default"><Building2 className="mr-1 h-3 w-3" />Client</Badge>;
    default:
      return <Badge variant="secondary"><User className="mr-1 h-3 w-3" />User</Badge>;
  }
}

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          View and manage all registered users, change roles, and moderate accounts.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockUsers.filter((u) => u.role === "client").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Basic Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockUsers.filter((u) => u.role === "user").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            A list of all registered users and their current roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Businesses</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || undefined} alt={user.name} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{user.businessCount}</TableCell>
                  <TableCell>
                    {user.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
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
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Change role</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Ban user
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete user
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
