import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, ThumbsUp, ThumbsDown, MessageSquare, Plus } from "lucide-react";
import { toast } from "sonner";
import { type Note, type Task } from "@/types/task";
import { useAuth } from "@/hooks/useAuth";
import { apiCall } from "@/lib/api-client";

interface TaskNotesProps {
  task: Task;
  onNotesUpdate?: (notes: Note[]) => void;
}

export function TaskNotes({ task, onNotesUpdate }: TaskNotesProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>(task.notes || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [isPositive, setIsPositive] = useState(true);
  const [loading, setLoading] = useState(false);

  const isTaskOwner = user?.id === task.creatorId;

  const handleAddNote = async () => {
    if (!newNoteText.trim()) {
      toast.error("Please enter a note");
      return;
    }

    setLoading(true);
    try {
      const response = await apiCall("POST", `/task/${task.id}/notes`, {
        text: newNoteText.trim(),
        isPositive,
      });

      if (response.success) {
        const newNote = response.data as Note;
        const updatedNotes = [newNote, ...notes];
        setNotes(updatedNotes);
        onNotesUpdate?.(updatedNotes);
        setNewNoteText("");
        setShowAddForm(false);
        toast.success("Note added successfully");
      }
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!isTaskOwner) {
      toast.error("Only task owner can delete notes");
      return;
    }

    setLoading(true);
    try {
      const response = await apiCall("DELETE", `/task/${task.id}/notes/${noteId}`);

      if (response.success) {
        const updatedNotes = notes.filter(note => note.id !== noteId);
        setNotes(updatedNotes);
        onNotesUpdate?.(updatedNotes);
        toast.success("Note deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserInitials = (userName: string) => {
    return userName
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Feedback & Notes ({notes.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            variant="outline"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Feedback
          </Button>
        )}

        {showAddForm && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="space-y-3">
              <div>
                <Label htmlFor="note-text">Your feedback</Label>
                <Input
                  id="note-text"
                  placeholder="Share your thoughts about this task..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="note-type"
                  checked={isPositive}
                  onCheckedChange={setIsPositive}
                />
                <Label htmlFor="note-type" className="flex items-center gap-2">
                  {isPositive ? (
                    <>
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                      Positive feedback
                    </>
                  ) : (
                    <>
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                      Constructive feedback
                    </>
                  )}
                </Label>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddNote}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Adding..." : "Add Note"}
                </Button>
                <Button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewNoteText("");
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

        {/* Notes List */}
        {notes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No feedback yet</p>
            <p className="text-sm">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getUserInitials(note.user.name || "U")}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {note.user.name || "Unknown User"}
                        </span>
                        <Badge
                          variant={note.isPositive ? "default" : "secondary"}
                          className={`text-xs ${
                            note.isPositive
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-orange-100 text-orange-800 hover:bg-orange-200"
                          }`}
                        >
                          {note.isPositive ? (
                            <ThumbsUp className="h-3 w-3 mr-1" />
                          ) : (
                            <ThumbsDown className="h-3 w-3 mr-1" />
                          )}
                          {note.isPositive ? "Positive" : "Constructive"}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(note.createdAt)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700">{note.text}</p>
                    </div>
                  </div>

                  {/* Delete button - only for task owner */}
                  {isTaskOwner && (
                    <Button
                      onClick={() => handleDeleteNote(note.id)}
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