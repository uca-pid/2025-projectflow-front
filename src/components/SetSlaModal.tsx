import { useState, useEffect } from "react";
import type { Task, SLA } from "@/types/task";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  OctagonAlert,
  TriangleAlert,
  XCircle,
  CalendarIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface SetSlaModalProps {
  open: boolean;
  onClose: () => void;
  task: Task;
  onUpdateTask: (task: Task) => void;
}

export function SetSlaModal({
  open,
  onClose,
  task,
  onUpdateTask,
}: SetSlaModalProps) {
  const [selectedSLA, setSelectedSLA] = useState<SLA | null>(null);
  const [slaStartedAt, setSlaStartedAt] = useState<Date>(new Date());

  useEffect(() => {
    if (task) {
      setSelectedSLA(task.sla || null);
      setSlaStartedAt(
        task.slaStartedAt ? new Date(task.slaStartedAt) : new Date(),
      );
    }
  }, [task]);

  const handleSubmit = () => {
    const updatedTask: Task = {
      ...task,
      sla: selectedSLA,
      slaStartedAt: slaStartedAt.toISOString(),
    };

    onUpdateTask(updatedTask);
    onClose();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Set Service Level Agreement</DialogTitle>
          <DialogDescription>
            Choose the appropriate SLA level for this task based on urgency and
            required response time
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Critical SLA Option */}
          <button
            type="button"
            onClick={() => setSelectedSLA("CRITICAL")}
            className={`w-full p-4 rounded-lg border-2 transition-all flex items-start gap-4 text-left ${
              selectedSLA === "CRITICAL"
                ? "border-red-500 bg-red-50"
                : "border-gray-200 hover:border-red-300 hover:bg-red-50/50"
            }`}
          >
            <div className="flex-shrink-0 mt-1">
              <OctagonAlert
                className={`w-8 h-8 ${selectedSLA === "CRITICAL" ? "text-red-600 fill-red-100" : "text-red-500"}`}
              />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-red-900 mb-1">Critical</div>
              <div className="text-sm text-red-700">
                Response required within{" "}
                <span className="font-semibold">48 hours</span>
              </div>
            </div>
            {selectedSLA === "CRITICAL" && (
              <div className="flex-shrink-0">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            )}
          </button>

          {/* Normal SLA Option */}
          <button
            type="button"
            onClick={() => setSelectedSLA("NORMAL")}
            className={`w-full p-4 rounded-lg border-2 transition-all flex items-start gap-4 text-left ${
              selectedSLA === "NORMAL"
                ? "border-yellow-500 bg-yellow-50"
                : "border-gray-200 hover:border-yellow-300 hover:bg-yellow-50/50"
            }`}
          >
            <div className="flex-shrink-0 mt-1">
              <TriangleAlert
                className={`w-8 h-8 ${
                  selectedSLA === "NORMAL"
                    ? "text-yellow-600 fill-yellow-100"
                    : "text-yellow-500"
                }`}
              />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-yellow-900 mb-1">Normal</div>
              <div className="text-sm text-yellow-700">
                Response required within{" "}
                <span className="font-semibold">5 business days</span>
              </div>
            </div>
            {selectedSLA === "NORMAL" && (
              <div className="flex-shrink-0">
                <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            )}
          </button>

          {/* None SLA Option */}
          <button
            type="button"
            onClick={() => setSelectedSLA(null)}
            className={`w-full p-4 rounded-lg border-2 transition-all flex items-start gap-4 text-left ${
              selectedSLA === null
                ? "border-gray-400 bg-gray-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
            }`}
          >
            <div className="flex-shrink-0 mt-1">
              <XCircle
                className={`w-8 h-8 ${selectedSLA === null ? "text-gray-600" : "text-gray-400"}`}
              />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">None</div>
              <div className="text-sm text-gray-600">
                No SLA required for this task
              </div>
            </div>
            {selectedSLA === null && (
              <div className="flex-shrink-0">
                <div className="w-5 h-5 rounded-full bg-gray-500 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            )}
          </button>
        </div>

        {selectedSLA !== null && (
          <div className="space-y-2">
            <label className="text-sm font-medium">SLA Start Date & Time</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !slaStartedAt && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {slaStartedAt ? (
                    <>
                      {formatDate(slaStartedAt)} at {formatTime(slaStartedAt)}
                    </>
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={slaStartedAt}
                  onSelect={(date: Date) => {
                    if (date) {
                      // Preserve the current time when selecting a new date
                      const newDate = new Date(date);
                      newDate.setHours(slaStartedAt.getHours());
                      newDate.setMinutes(slaStartedAt.getMinutes());
                      setSlaStartedAt(newDate);
                    }
                  }}
                  initialFocus
                />
                <div className="border-t p-3 space-y-2">
                  <label className="text-xs font-medium">Time</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={slaStartedAt.getHours()}
                      onChange={(e) => {
                        const newDate = new Date(slaStartedAt);
                        newDate.setHours(Number.parseInt(e.target.value) || 0);
                        setSlaStartedAt(newDate);
                      }}
                      className="w-16 rounded-md border px-2 py-1 text-sm"
                      placeholder="HH"
                    />
                    <span className="flex items-center">:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={slaStartedAt.getMinutes()}
                      onChange={(e) => {
                        const newDate = new Date(slaStartedAt);
                        newDate.setMinutes(
                          Number.parseInt(e.target.value) || 0,
                        );
                        setSlaStartedAt(newDate);
                      }}
                      className="w-16 rounded-md border px-2 py-1 text-sm"
                      placeholder="MM"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Set SLA
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
