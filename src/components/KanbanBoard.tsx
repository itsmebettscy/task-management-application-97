
import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Task, TaskStatus } from "@/types/task";
import { useTask } from "@/contexts/TaskContext";
import { TaskCard } from "@/components/TaskCard";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export function KanbanBoard() {
  const { tasks, updateTask } = useTask();
  const { toast } = useToast();
  
  const columns = {
    "todo": tasks.filter(task => task.status === "todo"),
    "in-progress": tasks.filter(task => task.status === "in-progress"),
    "completed": tasks.filter(task => task.status === "completed"),
  };

  const columnTitles = {
    "todo": "To Do",
    "in-progress": "In Progress",
    "completed": "Completed",
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a valid droppable area
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const taskId = draggableId;
    const newStatus = destination.droppableId as TaskStatus;

    // Update task status
    updateTask(taskId, { status: newStatus })
      .then(() => {
        toast({
          title: "Task updated",
          description: `Task moved to ${columnTitles[newStatus]}.`,
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to update task status.",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-4 h-auto md:h-[calc(100vh-250px)] pb-20">
      <DragDropContext onDragEnd={handleDragEnd}>
        {Object.entries(columns).map(([columnId, columnTasks]) => (
          <div key={columnId} className="w-full md:w-1/3 h-auto md:h-full">
            <div className="bg-secondary/50 dark:bg-secondary/30 p-4 rounded-lg h-full flex flex-col">
              <h3 className="font-medium text-lg mb-4 text-center">
                {columnTitles[columnId as keyof typeof columnTitles]} ({columnTasks.length})
              </h3>
              
              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-1 overflow-y-auto space-y-4 p-1"
                  >
                    <AnimatePresence>
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <motion.div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              style={{
                                ...provided.draggableProps.style,
                                transform: snapshot.isDragging
                                  ? provided.draggableProps.style?.transform
                                  : "none",
                              }}
                              className={snapshot.isDragging ? "z-50" : ""}
                            >
                              <TaskCard task={task} />
                            </motion.div>
                          )}
                        </Draggable>
                      ))}
                    </AnimatePresence>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        ))}
      </DragDropContext>
    </div>
  );
}
