import BasicPageLayout from "@/components/layouts/BasicPageLayout";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, CircleAlert, Home } from "lucide-react";
import LoadingPage from "@/pages/LoadingPage";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Task } from "@/types/task";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function ApplyPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [applying, setApplying] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [task, setTask] = useState<Task>();

  const isOwner = task?.creatorId === user?.id;
  const isAssigned = task?.assignedUsers?.some((u) => u.id == user?.id);

  useEffect(() => {
    try {
      fetch(`${import.meta.env.VITE_API_URL}/task/${taskId}`, {
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          setTask(data.data);
        });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const handleApply = async () => {
    setApplying(true);
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/task/${taskId}/apply`,
      {
        method: "POST",
        credentials: "include",
      },
    );
    setApplying(false);

    if (!response.ok) {
      toast.error("Error applying to task");
    } else {
      toast.success("Task applied successfully");
      setSuccess(true);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <div>Error {error}</div>;
  }

  return (
    <BasicPageLayout>
      <div className="mx-auto py-8 w-full flex items-center justify-center">
        <Card className="w-1/2 h-screen/2 flex items-center justify-center flex-col">
          <CardTitle>
            <h1 className="text-4xl font-bold">Apply As Viewer</h1>
          </CardTitle>
          <p className="text-gray-600 mb-2">You are applying for this task:</p>
          <div className="flex flex-col items-center border border-gray-300 p-4 rounded-lg">
            <p className="text-gray-600">{task?.title}</p>
          </div>
          <p className="text-gray-600 text-center p-3">
            {!success &&
              "If you are interested in this task, please click the button below:"}
            {success && (
              <>
                {"You have successfully applied to this task!"} <br />
                {
                  "Now you have to wait for the owner to accept your application."
                }
              </>
            )}
          </p>
          <div className="flex flex-row gap-4">
            <Button
              className="w-48"
              disabled={applying || success || isOwner || isAssigned}
              onClick={handleApply}
            >
              {isOwner ? (
                <>
                  <CircleAlert className="h-4 w-4" />
                  You own this task!
                </>
              ) : isAssigned ? (
                <>
                  <CircleAlert className="h-4 w-4" />
                  You are already assigned!
                </>
              ) : (
                <>
                  <ClipboardList className="h-4 w-4" />
                  Apply
                </>
              )}
            </Button>
            {success && (
              <Button
                className="w-48"
                onClick={() => {
                  navigate("/");
                }}
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            )}
          </div>
        </Card>
      </div>
    </BasicPageLayout>
  );
}
