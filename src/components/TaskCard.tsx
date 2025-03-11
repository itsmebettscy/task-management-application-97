
import { Task } from "@/types/task";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useTask } from "@/contexts/TaskContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import { Link } from "react-router-dom";

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

export function TaskCard({ task }: { task: Task }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { deleteTask, isLoading } = useTask();

  return (
    <Card className="p-6 space-y-4 transition-all duration-300 hover:shadow-lg animate-fade-in group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Badge variant="outline" className={`${statusColors[task.status]} text-white`}>
            {statusLabels[task.status]}
          </Badge>
          <Link to={`/task/${task.id}`} className="block">
            <h3 className="text-xl font-semibold mt-2 group-hover:text-blue-600 transition-colors">
              {task.title}
            </h3>
          </Link>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
              </DialogHeader>
              <TaskForm 
                initialData={task}
                onSubmit={() => setIsEditOpen(false)}
                mode="edit"
              />
            </DialogContent>
          </Dialog>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => deleteTask(task.id)}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="text-gray-600 line-clamp-2">{task.description}</p>
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-400">
          Created: {new Date(task.createdAt).toLocaleDateString()}
        </p>
        <Link to={`/task/${task.id}`} className="text-blue-500 hover:text-blue-700 flex items-center text-sm">
          <span className="mr-1">View Details</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </Card>
  );
}
