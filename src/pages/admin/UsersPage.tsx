import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
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
import BasicPageLayout from "@/components/layouts/BasicPageLayout";
import { type User } from "@/types/user";
import { apiCall } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[] | null>();
  const { user: me } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  //Fetch users from API
  useEffect(() => {
    try {
      apiCall("GET", "/user/getAll").then((response) => {
        setUsers(response.data as User[]);
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return;
  }

  if (error) {
    return <p>Error</p>;
  }

  const handleUserUpdate = async (user: User) => {
    try {
      const response = await apiCall(
        "PUT",
        `/user/update/${selectedUser?.id}`,
        {
          userToUpdateData: user,
        },
      );

      if (response.success) {
        toast.success("User updated successfully");
        setUsers((prevUsers) =>
          prevUsers?.map((u) =>
            u.id === selectedUser?.id ? (response.data as User) : u,
          ),
        );
        setEditModalOpen(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const handleUserDelete = async () => {
    try {
      const response = await apiCall("DELETE", `/user/${selectedUser?.id}`);

      if (response.success) {
        toast.success("User deleted successfully");
        setUsers((prevUsers) =>
          prevUsers?.filter((u) => u.id !== selectedUser?.id),
        );

        setDeleteModalOpen(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  return (
    <BasicPageLayout>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage all users in the system
          </p>
        </div>

        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NAME
                </TableHead>
                <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  EMAIL
                </TableHead>
                <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROLE
                </TableHead>
                <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  JOINED
                </TableHead>
                <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LAST ACTIVITY
                </TableHead>
                <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users &&
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {user.id === me?.id ? (
                          <AvatarImage src={me?.image} />
                        ) : (
                          <AvatarImage
                            src={user.image}
                            alt={`${user.name?.charAt(0)}`}
                          />
                        )}
                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.id}
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
          onUserUpdated={handleUserUpdate}
        />
        <DeleteUserModal
          user={selectedUser}
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onUserDelete={handleUserDelete}
        />
      </div>
    </BasicPageLayout>
  );
}
