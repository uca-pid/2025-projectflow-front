import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import type { Task, CreateTaskData, UpdateTaskData, TaskStatus } from "@/types/task";
import { TasksTable } from "@/components/TasksTable";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { EditTaskModal } from "@/components/EditTaskModal";
import { DeleteTaskModal } from "@/components/DeleteTaskModal";
import { ProfileModal } from "@/components/ProfileModal";
import { Button } from "@/components/ui/button";

export default function TasksPage() {
  const { user, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Generate unique ID for new tasks
  const generateId = (): string => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  // Update task status based on deadline
  const updateTaskStatus = (task: Task): TaskStatus => {
    const now = new Date();
    const deadline = new Date(task.deadline);
    
    if (task.status === 'completed') {
      return 'completed';
    }
    
    if (deadline < now) {
      return 'overdue';
    }
    
    return task.status;
  };

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('projectflow-tasks');
    if (savedTasks) {
      try {
        const parsedTasks: Task[] = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          deadline: new Date(task.deadline),
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt)
        }));
        
        // Update task statuses based on current time
        const updatedTasks = parsedTasks.map(task => ({
          ...task,
          status: updateTaskStatus(task)
        }));
        
        setTasks(updatedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
        toast.error("Error loading tasks", {
          description: "Failed to load saved tasks"
        });
      }
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('projectflow-tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  // Update overdue tasks every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(task => ({
          ...task,
          status: updateTaskStatus(task)
        }));
        return updatedTasks;
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const handleCreateTask = (taskData: CreateTaskData) => {
    const newTask: Task = {
      id: generateId(),
      title: taskData.title,
      description: taskData.description,
      deadline: taskData.deadline,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTasks(prevTasks => [...prevTasks, newTask]);
    
    toast.success("Task created successfully", {
      description: `"${taskData.title}" has been added to your tasks`,
      style: {
        background: 'hsl(0 0% 100%)',
        border: '1px solid hsl(0 0% 89.8%)',
        color: 'hsl(0 0% 3.9%)',
      }
    });
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleUpdateTask = (taskId: string, taskData: UpdateTaskData) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, ...taskData, updatedAt: new Date() }
          : task
      )
    );

    toast.success("Task updated successfully", {
      description: "Task has been updated",
      style: {
        background: 'hsl(0 0% 100%)',
        border: '1px solid hsl(0 0% 89.8%)',
        color: 'hsl(0 0% 3.9%)',
      }
    });
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(task => task.id === taskId);
    if (taskToDelete) {
      setSelectedTask(taskToDelete);
      setShowDeleteModal(true);
    }
  };

  const handleConfirmDelete = (taskId: string) => {
    const taskTitle = tasks.find(task => task.id === taskId)?.title;
    
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    
    toast.success("Task deleted successfully", {
      description: `"${taskTitle}" has been removed`,
      style: {
        background: 'hsl(0 0% 100%)',
        border: '1px solid hsl(0 0% 89.8%)',
        color: 'hsl(0 0% 3.9%)',
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PF</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">ProjectFlow</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 text-sm hidden sm:block">
                ¡Hola, {user?.name}!
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfileModal(true)}
                className="flex items-center space-x-2"
              >
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block">Perfil</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestión de Tareas
              </h1>
              <p className="mt-2 text-gray-600">
                Organiza y gestiona tus tareas con fechas límite específicas
              </p>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Nueva Tarea
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-2xl font-bold text-gray-900">
              {tasks.length}
            </div>
            <div className="text-gray-600">Total de Tareas</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-2xl font-bold text-blue-600">
              {tasks.filter(task => task.status === 'in-progress').length}
            </div>
            <div className="text-gray-600">En Progreso</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(task => task.status === 'completed').length}
            </div>
            <div className="text-gray-600">Completadas</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-2xl font-bold text-red-600">
              {tasks.filter(task => task.status === 'overdue').length}
            </div>
            <div className="text-gray-600">Vencidas</div>
          </div>
        </div>

        {/* Tasks Table */}
        <TasksTable
          tasks={tasks}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />

        {/* Modals */}
        <CreateTaskModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateTask={handleCreateTask}
        />

        <EditTaskModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTask(null);
          }}
          onUpdateTask={handleUpdateTask}
          task={selectedTask}
        />

        <DeleteTaskModal
          open={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedTask(null);
          }}
          onConfirmDelete={handleConfirmDelete}
          task={selectedTask}
        />

        <ProfileModal
          open={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
        </div>
      </div>
    </div>
  );
}