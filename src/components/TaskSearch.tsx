
import { Input } from "@/components/ui/input";
import { useTask } from "@/contexts/TaskContext";
import { Search } from "lucide-react";

export function TaskSearch() {
  const { search } = useTask();
  const { searchTerm, setSearchTerm } = search;

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        placeholder="Search tasks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
