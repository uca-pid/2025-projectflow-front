import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

import { type ViewType } from "@/types/task";

interface TasksViewSelectorProps {
  selectedView: ViewType;
  onViewChange: (value: ViewType) => void;
}

export function TasksViewSelector({
  selectedView,
  onViewChange,
}: TasksViewSelectorProps) {
  const navigate = useNavigate();
  const handleValueChange = (value: string) => {
    onViewChange(value as ViewType);
  };

  return (
    <Select value={selectedView} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[140px] bg-white shadow">
        <SelectValue placeholder="Select a view" />
      </SelectTrigger>
      <SelectContent className="bg-white">
        <SelectGroup>
          <SelectLabel>Views</SelectLabel>
          <SelectItem value="table">Table View</SelectItem>
          <SelectItem value="kanban">Kanban View</SelectItem>
          <SelectItem value="tree">Tree View</SelectItem>
          <div
            className="p-2 text-sm rounded-lg hover:bg-gray-100 cursor-default"
            onClick={() => navigate("/sla")}
          >
            SLA Dashboard
          </div>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
