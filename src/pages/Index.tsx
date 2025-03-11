
import { useState } from "react";
import { TaskForm } from "@/components/TaskForm";
import { TaskCard } from "@/components/TaskCard";
import { TaskProvider, useTask } from "@/contexts/TaskContext";
import { TaskPagination } from "@/components/TaskPagination";
import { TaskSearch } from "@/components/TaskSearch";
import { TaskFilter } from "@/components/TaskFilter";
import { TaskHeader } from "@/components/TaskHeader";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function TaskList() {
  const { paginatedTasks, filteredTasks, isLoading } = useTask();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const renderTaskCards = () => {
    if (isLoading) {
      return Array(6).fill(0).map((_, index) => (
        <div key={index} className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      ));
    }

    if (paginatedTasks.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-gray-100 p-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <path d="M12 3h.11a2 2 0 0 1 1.95 1.72L14.5 9h6a2 2 0 0 1 1.54 3.27l-5 6A2 2 0 0 1 15 19H4a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2h8Z"></path>
                </svg>
              </div>
              <div>
                <p className="text-xl font-medium text-gray-700">No tasks yet</p>
                <p className="text-gray-500 mt-1">Create your first task to get started!</p>
              </div>
              <button 
                onClick={() => setIsCreateOpen(true)}
                className="text-blue-600 font-medium hover:underline"
              >
                Create a new task
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-gray-100 p-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div>
                <p className="text-xl font-medium text-gray-700">No matching tasks</p>
                <p className="text-gray-500 mt-1">Try adjusting your search or filter settings</p>
              </div>
            </div>
          )}
        </div>
      );
    }

    return paginatedTasks.map((task) => (
      <TaskCard key={task.id} task={task} />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="flex flex-col gap-6 mb-8">
          <TaskHeader isCreateOpen={isCreateOpen} setIsCreateOpen={setIsCreateOpen} />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
            <TaskSearch />
            <TaskFilter />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {renderTaskCards()}
        </div>
        
        {filteredTasks.length > 0 && (
          <div className="mt-8">
            <TaskPagination />
          </div>
        )}
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
