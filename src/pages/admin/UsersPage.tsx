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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditUserModal from "@/components/EditUserModal";
import DeleteUserModal from "@/components/ConfirmUserDeleteModal";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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
              <TableHead>Actions</TableHead>
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
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setEditModalOpen(true);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setDeleteModalOpen(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
      <EditUserModal
        user={selectedUser}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
      <DeleteUserModal
        user={selectedUser}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
      />
    </div>
  );
}
