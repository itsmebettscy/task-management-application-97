
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTask } from "@/contexts/TaskContext";
import { Task } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["todo", "in-progress", "completed"]),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  initialData?: Task;
  onSubmit?: () => void;
  mode?: "create" | "edit";
}

export function TaskForm({ initialData, onSubmit, mode = "create" }: TaskFormProps) {
  const { addTask, updateTask, isLoading } = useTask();
  const { toast } = useToast();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      status: "todo",
    },
  });

  const handleSubmit = async (data: TaskFormData) => {
    if (mode === "edit" && initialData) {
      await updateTask(initialData.id, data);
    } else {
      // Ensure all required fields are present before calling addTask
      const taskData: Omit<Task, "id" | "createdAt"> = {
        title: data.title,
        description: data.description,
        status: data.status
      };
      await addTask(taskData);
    }
    form.reset();
    onSubmit?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter task description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === "edit" ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{mode === "edit" ? "Update Task" : "Create Task"}</>
          )}
        </Button>
      </form>
    </Form>
  );
}
