
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskForm } from "@/components/TaskForm";
import { TaskCard } from "@/components/TaskCard";
import { TaskProvider, useTask } from "@/contexts/TaskContext";
import { TaskPagination } from "@/components/TaskPagination";

function TaskList() {
  const { paginatedTasks } = useTask();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-2">Manage your tasks efficiently</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <TaskForm onSubmit={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paginatedTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          {paginatedTasks.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No tasks yet. Create your first task!</p>
            </div>
          )}
        </div>
        
        <TaskPagination />
      </div>
    </div>
  );
}

const Index = () => {
  return (
    <TaskProvider>
      <TaskList />
    </TaskProvider>
  );
};

export default Index;
