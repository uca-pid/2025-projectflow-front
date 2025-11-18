import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMemo, useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiCall } from "@/lib/api-client";
import { type Task } from "@/types/task";
import { type User } from "@/types/user";
import { Loader2 } from "lucide-react";

interface UserScore {
  userId: string;
  score: number;
  user?: User;
}

interface RankChartProps {
  tasks: Task[];
  period: string;
}

export const RankChart = ({ tasks, period }: RankChartProps) => {
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  const [loading, setLoading] = useState(false);

  // Calculate scores from tasks
  const userScores = useMemo(() => {
    const scoresMap = new Map<string, number>();

    for (const task of tasks) {
      if (task.completedById) {
        scoresMap.set(
          task.completedById,
          (scoresMap.get(task.completedById) || 0) + 1,
        );
      }
    }

    return Array.from(scoresMap.entries())
      .map(([userId, score]) => ({ userId, score }))
      .sort((a, b) => b.score - a.score);
  }, [tasks]);

  // Fetch user data for all unique user IDs
  useEffect(() => {
    const fetchUsers = async () => {
      const userIds = userScores.map((s) => s.userId);
      const missingIds = userIds.filter((id) => !users.has(id));

      if (missingIds.length === 0) return;

      setLoading(true);
      try {
        const userData = await Promise.all(
          missingIds.map(async (id) => {
            try {
              const res = await apiCall("GET", `/user/${id}`);
              const user = res.data as User;
              return [id, user] as const;
            } catch (error) {
              console.error(`Failed to fetch user ${id}:`, error);
              return null;
            }
          }),
        );

        setUsers((prev) => {
          const newMap = new Map(prev);
          userData.forEach((entry) => {
            if (entry) {
              newMap.set(entry[0], entry[1]);
            }
          });
          return newMap;
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchUsers();
  }, [userScores, users]);

  // Combine scores with user data
  const rankedUsers: UserScore[] = useMemo(
    () =>
      userScores.map((score) => ({
        ...score,
        user: users.get(score.userId),
      })),
    [userScores, users],
  );

  if (loading)
    return (
      <Card className="flex flex-col w-full">
        <CardHeader className="items-center pb-0">
          <CardTitle>User Task Completions</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 min-h-[200px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <Loader2 className="animate-spin text-primary" />
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );

  return (
    <Card className="flex flex-col w-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>User Task Completions</CardTitle>
        <CardDescription>{period}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 min-h-[200px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Completed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankedUsers.length > 0 ? (
              rankedUsers.map(({ userId, score, user }) => (
                <TableRow key={userId} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.image} alt={user?.name} />
                        <AvatarFallback>
                          {user?.name?.slice(0, 2).toUpperCase() ?? "??"}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user?.name ?? userId}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{score}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-center text-muted-foreground"
                >
                  No completed tasks yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
