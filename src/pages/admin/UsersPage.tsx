import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image: string;
  createdAt: Date;
  updatedAt: Date;
  role: string;
};

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[] | null>();

  //Fetch users from API
  useEffect(() => {
    async function fetchUsers() {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/getAll`,
        {
          credentials: "include",
        },
      );
      const data = await response.json();
      setUsers(data.data);
    }

    fetchUsers();
  }, [user]);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage all users in the system</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users &&
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={""} alt={`${user.name?.charAt(0)}`} />
                      <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.name || user.id}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>{user.email || "No email"}</TableCell>

                  <TableCell>
                    {user.role === "ADMIN" && <Badge>Admin</Badge>}
                    {user.role === "USER" && (
                      <Badge variant="outline">User</Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    {user.updatedAt
                      ? new Date(user.updatedAt).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {users?.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No users found.</p>
        </div>
      )}

      <div className="mt-4 text-sm text-muted-foreground">
        Showing {users?.length} users
      </div>
    </div>
  );
}
