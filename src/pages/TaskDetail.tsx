
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTask } from "@/contexts/TaskContext";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Calendar, Clock } from "lucide-react";
import { TaskForm } from "@/components/TaskForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const statusColors = {
  "todo": "bg-yellow-500",
  "in-progress": "bg-blue-500",
  "completed": "bg-green-500",
};

const statusLabels = {
  "todo": "To Do",
  "in-progress": "In Progress",
  "completed": "Completed",
};

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTask, deleteTask, isLoading } = useTask();
  const [task, setTask] = useState<Task | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadTask() {
      if (!id) return;
      
      try {
        setLoading(true);
        const taskData = await getTask(id);
        setTask(taskData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load task details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadTask();
  }, [id, getTask, toast]);

  const handleDelete = async () => {
    if (!task) return;
    
    try {
      await deleteTask(task.id);
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-12">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-6 w-64" />
          </div>
          <Card className="p-8">
            <Skeleton className="h-8 w-40 mb-6" />
            <Skeleton className="h-24 w-full mb-8" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-10 rounded-md" />
                <Skeleton className="h-10 w-10 rounded-md" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Task Not Found</h1>
          <p className="text-gray-600 mb-6">
            The task you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Tasks
          </Button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(task.createdAt).toLocaleDateString();
  const formattedTime = new Date(task.createdAt).toLocaleTimeString();

  return (
    <div className="min-h-screen bg-gray-50 pt-12">
      <div className="container max-w-4xl mx-auto px-4">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Tasks
        </Button>
        
        <Card className="p-8 shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <Badge variant="outline" className={`${statusColors[task.status]} text-white px-3 py-1`}>
              {statusLabels[task.status]}
            </Badge>
            <div className="flex gap-2">
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <Button onClick={() => setIsEditOpen(true)} variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                  </DialogHeader>
                  <TaskForm 
                    initialData={task}
                    onSubmit={() => {
                      setIsEditOpen(false);
                      // Refresh task data
                      getTask(task.id).then(updatedTask => {
                        if (updatedTask) setTask(updatedTask);
                      });
                    }}
                    mode="edit"
                  />
                </DialogContent>
              </Dialog>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleDelete}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{task.title}</h1>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 gap-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Created: {formattedDate}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>Time: {formattedTime}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
