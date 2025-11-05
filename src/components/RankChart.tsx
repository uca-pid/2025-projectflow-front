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
import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type Task } from "@/types/task";
import { type User } from "@/types/user";

export const RankChart = ({ tasks }: { tasks: Task[] }) => {
  // Create a stable key based on task completion data
  const tasksKey = tasks.map((t) => `${t.id}-${t.completedById}`).join(",");

  const userScores = useMemo(() => {
    const scoresMap = new Map<
      string,
      { userData: Partial<User>; score: number }
    >();

    tasks.forEach((task) => {
      if (task.completedById && task.completedBy) {
        const existing = scoresMap.get(task.completedById);
        if (existing) {
          existing.score += 1;
        } else {
          scoresMap.set(task.completedById, {
            userData: task.completedBy,
            score: 1,
          });
        }
      }
    });

    return Array.from(scoresMap.entries())
      .map(([userId, data]) => ({
        userId,
        ...data,
      }))
      .sort((a, b) => b.score - a.score);
  }, [tasksKey]);

  return (
    <Card className="flex flex-col w-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>User Task Completions</CardTitle>
        <CardDescription></CardDescription>
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
            {userScores.length > 0 ? (
              userScores.map((user) => (
                <TableRow key={user.userId} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.userData.image || ""} />
                        <AvatarFallback className="bg-gray-800 text-white font-bold">
                          {user.userData.name?.charAt(0)?.toUpperCase() ||
                            user.userData.email?.charAt(0)?.toUpperCase() ||
                            "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {user.userData.name || user.userData.email || "Unknown"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {user.score}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
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
