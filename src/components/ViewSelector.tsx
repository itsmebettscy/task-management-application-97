
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { List, Grid3x3, Kanban, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export type ViewType = "list" | "grid" | "kanban" | "calendar";

interface ViewSelectorProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function ViewSelector({ currentView, onViewChange }: ViewSelectorProps) {
  return (
    <ToggleGroup type="single" value={currentView} onValueChange={(value) => value && onViewChange(value as ViewType)}>
      <ToggleGroupItem value="list" aria-label="List view" data-testid="list-view-toggle">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <List className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">List</span>
        </motion.div>
      </ToggleGroupItem>
      
      <ToggleGroupItem value="grid" aria-label="Grid view" data-testid="grid-view-toggle">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Grid3x3 className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Grid</span>
        </motion.div>
      </ToggleGroupItem>
      
      <ToggleGroupItem value="kanban" aria-label="Kanban view" data-testid="kanban-view-toggle">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Kanban className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Kanban</span>
        </motion.div>
      </ToggleGroupItem>
      
      <ToggleGroupItem value="calendar" aria-label="Calendar view" data-testid="calendar-view-toggle">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Calendar className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Calendar</span>
        </motion.div>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
