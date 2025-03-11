import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTask } from "@/contexts/TaskContext";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Calendar, Clock, AlertCircle } from "lucide-react";
import { TaskForm } from "@/components/TaskForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskDetailSkeleton } from "@/components/TaskDetailSkeleton";
import { useToast } from "@/hooks/use-toast";
import { TaskProvider } from "@/contexts/TaskContext";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

function TaskDetailContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTask, deleteTask, isLoading } = useTask();
  const [task, setTask] = useState<Task | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
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
    return <TaskDetailSkeleton />;
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="bg-red-100 text-red-800 p-4 rounded-full inline-flex mb-4">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-4">Task Not Found</h1>
          <p className="text-gray-600 mb-6">
            The task you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate("/")} className="animate-bounce">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Tasks
          </Button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(task.createdAt).toLocaleDateString();
  const formattedTime = new Date(task.createdAt).toLocaleTimeString();

  return (
    <div className="min-h-screen bg-gray-50 pt-12 animate-fade-in">
      <div className="container max-w-4xl mx-auto px-4">
        <Button 
          variant="outline" 
          className="mb-6 hover:translate-x-[-4px] transition-transform"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Tasks
        </Button>
        
        <Card className="p-8 shadow-lg border-t-4 hover:shadow-xl transition-shadow duration-300" 
              style={{ borderTopColor: task.status === 'todo' ? '#eab308' : task.status === 'in-progress' ? '#3b82f6' : '#22c55e' }}>
          <div className="flex justify-between items-start mb-6">
            <Badge variant="outline" className={`${statusColors[task.status]} text-white px-3 py-1`}>
              {statusLabels[task.status]}
            </Badge>
            <div className="flex gap-2">
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <Button 
                  onClick={() => setIsEditOpen(true)} 
                  variant="outline" 
                  size="icon"
                  className="hover:bg-gray-100 transition-colors"
                >
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
                onClick={() => setIsDeleteAlertOpen(true)}
                className="hover:bg-red-50 transition-colors"
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{task.title}</h1>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{task.description}</p>
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

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function TaskDetail() {
  return (
    <TaskProvider>
      <TaskDetailContent />
    </TaskProvider>
  );
}
