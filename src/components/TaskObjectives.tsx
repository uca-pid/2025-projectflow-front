import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Target, Plus } from "lucide-react";
import { toast } from "sonner";
import { type Objective, type Task } from "@/types/task";
import { useAuth } from "@/hooks/useAuth";
import { apiCall } from "@/lib/api-client";
import { flattenTasks } from "@/lib/task-utils";

interface TaskObjectivesProps {
  task: Task;
  onObjectivesUpdate?: (objectives: Objective[]) => void;
}

export function TaskObjectives({
  task,
  onObjectivesUpdate,
}: TaskObjectivesProps) {
  const { user } = useAuth();
  const [objectives, setObjectives] = useState<Objective[]>(
    task.objectives || [],
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newObjectiveText, setNewObjectiveText] = useState("");
  const [newTaskGoal, setNewTaskGoal] = useState("");
  const [newPeriod, setNewPeriod] = useState<"DAY" | "WEEK" | "MONTH" | "YEAR">(
    "WEEK",
  );
  const [loading, setLoading] = useState(false);

  const isTaskOwner = user?.id === task.creatorId;

  const calculateProgress = (objective: Objective) => {
    const totalTasks = objective.taskGoal;
    const completedTasks = flattenTasks(task.subTasks).filter(
      (s) => s.status === "DONE",
    ).length;
    return (completedTasks / totalTasks) * 100;
  };

  const handleAddObjective = async () => {
    if (!newObjectiveText.trim()) {
      toast.error("Please enter an objective description");
      return;
    }

    const goalNumber = parseInt(newTaskGoal);
    if (!newTaskGoal || isNaN(goalNumber) || goalNumber <= 0) {
      toast.error("Please enter a valid goal number");
      return;
    }

    setLoading(true);
    try {
      const response = await apiCall("POST", `/task/${task.id}/objectives`, {
        objective: newObjectiveText.trim(),
        taskGoal: goalNumber,
        period: newPeriod,
      });

      if (response.success) {
        const newObjective = response.data as Objective;
        const updatedObjectives = [newObjective, ...objectives];
        setObjectives(updatedObjectives);
        onObjectivesUpdate?.(updatedObjectives);
        setNewObjectiveText("");
        setNewTaskGoal("");
        setNewPeriod("WEEK");
        setShowAddForm(false);
        toast.success("Objective added successfully");
      }
    } catch (error) {
      console.error("Error adding objective:", error);
      toast.error("Failed to add objective");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteObjective = async (objectiveId: string) => {
    if (!isTaskOwner) {
      toast.error("Only task owner can delete objectives");
      return;
    }

    setLoading(true);
    try {
      const response = await apiCall(
        "DELETE",
        `/task/${task.id}/objectives/${objectiveId}`,
      );

      if (response.success) {
        const updatedObjectives = objectives.filter(
          (obj) => obj.objectiveId !== objectiveId,
        );
        setObjectives(updatedObjectives);
        onObjectivesUpdate?.(updatedObjectives);
        toast.success("Objective deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting objective:", error);
      toast.error("Failed to delete objective");
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = (period: string) => {
    const labels = {
      DAY: "per day",
      WEEK: "per week",
      MONTH: "per month",
      YEAR: "per year",
    };
    return labels[period as keyof typeof labels] || period;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Objectives ({objectives.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showAddForm && isTaskOwner && (
          <Button
            onClick={() => setShowAddForm(true)}
            variant="outline"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Objective
          </Button>
        )}

        {showAddForm && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="space-y-3">
              <div>
                <Label htmlFor="objective-text">Objective Description</Label>
                <Input
                  id="objective-text"
                  placeholder="e.g., Complete customer calls"
                  value={newObjectiveText}
                  onChange={(e) => setNewObjectiveText(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="task-goal">Goal</Label>
                  <Input
                    id="task-goal"
                    type="number"
                    placeholder="e.g., 10"
                    min="1"
                    value={newTaskGoal}
                    onChange={(e) => setNewTaskGoal(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="period">Period</Label>
                  <select
                    id="period"
                    value={newPeriod}
                    onChange={(e) =>
                      setNewPeriod(e.target.value as typeof newPeriod)
                    }
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="DAY">Day</option>
                    <option value="WEEK">Week</option>
                    <option value="MONTH">Month</option>
                    <option value="YEAR">Year</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddObjective}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Adding..." : "Add Objective"}
                </Button>
                <Button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewObjectiveText("");
                    setNewTaskGoal("");
                    setNewPeriod("WEEK");
                  }}
                  variant="outline"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {objectives.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No objectives yet</p>
            {isTaskOwner && (
              <p className="text-sm">
                Add your first objective to get started!
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {objectives.map((obj) => (
              <div
                key={obj.objectiveId}
                className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-2">{obj.objective}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-semibold text-blue-600">
                        {obj.taskGoal}
                      </span>
                      <span>{getPeriodLabel(obj.period)}</span>
                    </div>
                    <Progress value={calculateProgress(obj)} className="mt-2" />
                  </div>

                  {isTaskOwner && (
                    <Button
                      onClick={() => handleDeleteObjective(obj.objectiveId)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
