import type { Task, CreateTaskData, UpdateTaskData } from '@/types/task';

const API_BASE_URL = 'http://localhost:4000';

class ApiError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

// Helper to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      error: errorData
    });
    throw new ApiError(response.status, errorData.message || 'Request failed');
  }
  return response.json();
};

export const taskApi = {
  // Get all tasks for the authenticated user
  async getTasks(): Promise<{ success: boolean; data: Task[] }> {
    console.log('Making API call to:', `${API_BASE_URL}/api/tasks`);
    
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
    });
    
    const result = await handleResponse(response);
    return result;
  },

  // Create a new task
  async createTask(taskData: CreateTaskData): Promise<{ success: boolean; data: Task }> {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify({
        title: taskData.title,
        description: taskData.description,
        deadline: taskData.deadline.toISOString(),
      }),
    });
    
    const result = await handleResponse(response);
    return result;
  },

  // Update an existing task
  async updateTask(taskId: number, taskData: UpdateTaskData): Promise<{ success: boolean; data: Task }> {
    const updatePayload: any = {};
    if (taskData.title !== undefined) updatePayload.title = taskData.title;
    if (taskData.description !== undefined) updatePayload.description = taskData.description;
    if (taskData.deadline !== undefined) updatePayload.deadline = taskData.deadline.toISOString();
    if (taskData.status !== undefined) {
      // Map frontend status to backend status
      const statusMap = {
        'pending': 'TODO',
        'in-progress': 'IN_PROGRESS', 
        'completed': 'DONE',
        'overdue': 'TODO', // Keep as TODO, backend will handle overdue logic
      };
      updatePayload.status = statusMap[taskData.status] || taskData.status;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify(updatePayload),
    });
    
    const result = await handleResponse(response);
    return result;
  },

  // Delete a task
  async deleteTask(taskId: number): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
    });
    
    const result = await handleResponse(response);
    return result;
  },
};

// Helper function to transform backend task to frontend task
export const transformBackendTask = (backendTask: any): Task => {
  // Map backend status to frontend status
  const statusMap: Record<string, any> = {
    'TODO': 'pending',
    'IN_PROGRESS': 'in-progress',
    'DONE': 'completed',
    'CANCELLED': 'pending',
  };

  return {
    id: backendTask.id,
    title: backendTask.title,
    description: backendTask.description || '',
    deadline: new Date(backendTask.deadline),
    status: statusMap[backendTask.status] || 'pending',
    createdAt: new Date(backendTask.createdAt),
    updatedAt: new Date(backendTask.updatedAt),
  };
};
