import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Task } from "@/types/task";

import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Plus,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface TreeNode {
  task: Task;
  x: number;
  y: number;
  width: number;
  height: number;
  children: TreeNode[];
  parent?: TreeNode;
}

interface TreeGraphProps {
  tasks: Task[] | null;
}

const statusColors = {
  TODO: "bg-gray-100 border-gray-300 text-gray-800",
  IN_PROGRESS: "bg-blue-100 border-blue-300 text-blue-800",
  DONE: "bg-green-100 border-green-300 text-green-800",
  CANCELLED: "bg-red-100 border-red-300 text-red-800",
};

const statusIcons = {
  TODO: Circle,
  IN_PROGRESS: Clock,
  DONE: CheckCircle2,
  CANCELLED: AlertCircle,
};

const NODE_WIDTH = 200;
const NODE_HEIGHT = 120;
const HORIZONTAL_SPACING = 60;
const VERTICAL_SPACING = 150;

export default function TrackedTreeGraph({ tasks }: TreeGraphProps) {
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate tree layout
  const calculateLayout = (tasks: Task[] | null): TreeNode[] => {
    if (!tasks || tasks.length === 0) {
      return [];
    }

    const createNode = (task: Task, parent?: TreeNode): TreeNode => {
      const node: TreeNode = {
        task,
        x: 0,
        y: 0,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        children: [],
        parent,
      };

      if (task.subTasks && task.subTasks.length > 0) {
        node.children = task.subTasks
          .filter((subtask) => subtask !== null && subtask !== undefined)
          .map((subtask) => createNode(subtask as Task, node));
      }

      return node;
    };

    const nodes = tasks
      .filter((task) => task !== null && task !== undefined)
      .map((task) => createNode(task));

    // Position nodes using a tree layout algorithm
    const positionNodes = (
      nodes: TreeNode[],
      startX: number,
      startY: number,
    ): number => {
      if (nodes.length === 0) return startX;

      let currentX = startX;

      nodes.forEach((node) => {
        if (node.children.length === 0) {
          // Leaf node
          node.x = currentX;
          node.y = startY;
          currentX += NODE_WIDTH + HORIZONTAL_SPACING;
        } else {
          // Internal node - position children first
          const childStartX = currentX;
          const childEndX = positionNodes(
            node.children,
            childStartX,
            startY + NODE_HEIGHT + VERTICAL_SPACING,
          );

          // Center parent over children
          const childrenWidth = childEndX - childStartX - HORIZONTAL_SPACING;
          node.x = childStartX + childrenWidth / 2 - NODE_WIDTH / 2;
          node.y = startY;

          currentX = childEndX;
        }
      });

      return currentX;
    };

    positionNodes(nodes, 0, 0);
    return nodes;
  };

  useEffect(() => {
    const nodes = calculateLayout(tasks!);
    setTreeNodes(nodes);
  }, [tasks]);

  // Get all connections for SVG lines
  const getConnections = (
    nodes: TreeNode[],
  ): Array<{ from: TreeNode; to: TreeNode }> => {
    const connections: Array<{ from: TreeNode; to: TreeNode }> = [];

    const traverse = (node: TreeNode) => {
      node.children.forEach((child) => {
        connections.push({ from: node, to: child });
        traverse(child);
      });
    };

    nodes.forEach(traverse);
    return connections;
  };

  // Get all nodes for rendering
  const getAllNodes = (nodes: TreeNode[]): TreeNode[] => {
    const allNodes: TreeNode[] = [];

    const traverse = (node: TreeNode) => {
      allNodes.push(node);
      node.children.forEach(traverse);
    };

    nodes.forEach(traverse);
    return allNodes;
  };

  const connections = getConnections(treeNodes);
  const allNodes = getAllNodes(treeNodes);

  // Calculate bounds for proper centering - handle empty case
  const bounds =
    allNodes.length > 0
      ? allNodes.reduce(
          (acc, node) => ({
            minX: Math.min(acc.minX, node.x),
            maxX: Math.max(acc.maxX, node.x + node.width),
            minY: Math.min(acc.minY, node.y),
            maxY: Math.max(acc.maxY, node.y + node.height),
          }),
          { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
        )
      : { minX: 0, maxX: 400, minY: 0, maxY: 300 };

  const svgWidth = bounds.maxX - bounds.minX + 200;
  const svgHeight = bounds.maxY - bounds.minY + 200;
  const offsetX = -bounds.minX + 100;
  const offsetY = -bounds.minY + 100;

  // Handle mouse events for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoom(Math.min(zoom * 1.2, 3));
  const handleZoomOut = () => setZoom(Math.max(zoom / 1.2, 0.3));

  return (
    <Card className="w-full h-[600px] relative overflow-hidden">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        <div className="flex-row space-x-2">
          <Button
            variant="outline"
            size="sm"
            title="Zoom In"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            title="Zoom Out"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tree Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Show empty state when no tasks */}
        {!tasks || tasks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium mb-2">No tasks to display</p>
              <p className="text-sm">Add a task to get started</p>
            </div>
          </div>
        ) : (
          <div
            className="relative origin-top-left transition-transform"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              width: svgWidth,
              height: svgHeight,
            }}
          >
            {/* SVG for connections */}
            <svg
              ref={svgRef}
              className="absolute inset-0 pointer-events-none"
              width={svgWidth}
              height={svgHeight}
            >
              {connections.map(({ from, to }, index) => {
                const fromX = from.x + offsetX + from.width / 2;
                const fromY = from.y + offsetY + from.height;
                const toX = to.x + offsetX + to.width / 2;
                const toY = to.y + offsetY;

                // Create curved connection
                const midY = fromY + (toY - fromY) / 2;

                return (
                  <path
                    key={index}
                    d={`M ${fromX} ${fromY} C ${fromX} ${midY} ${toX} ${midY} ${toX} ${toY}`}
                    stroke="#e2e8f0"
                    strokeWidth="2"
                    fill="none"
                    className="drop-shadow-sm"
                  />
                );
              })}
            </svg>

            {/* Task Nodes */}
            {allNodes.map((node) => {
              const StatusIcon =
                statusIcons[node.task.status as keyof typeof statusIcons];
              return (
                <div
                  key={node.task.id}
                  className="absolute pointer-events-auto"
                  style={{
                    left: node.x + offsetX,
                    top: node.y + offsetY,
                    width: node.width,
                    height: node.height,
                  }}
                >
                  <Card
                    className={`w-full h-auto cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                      statusColors[
                        node.task.status as keyof typeof statusColors
                      ]
                    } ${node.task.status === "DONE" ? "opacity-75" : ""}`}
                  >
                    <CardContent className="p-3 h-full flex flex-col">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <StatusIcon className="h-4 w-4 flex-shrink-0" />
                          {/*
                          <Badge
                            variant="secondary"
                            className={`text-xs ${priorityColors[node.task.priority]}`}
                          >
                            {node.task.priority}
                          </Badge>
                          */}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Title */}
                      <h3
                        className={`font-medium text-sm mb-2 line-clamp-2 ${
                          node.task.status === "DONE"
                            ? "line-through opacity-60"
                            : ""
                        }`}
                      >
                        {node.task.title}
                      </h3>

                      {/* Description */}
                      {node.task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2 flex-1">
                          {node.task.description}
                        </p>
                      )}

                      {/* Due Date */}
                      {node.task.deadline && (
                        <p className="text-xs font-medium text-muted-foreground mt-auto">
                          Due: {new Date(node.task.deadline).toLocaleString()}
                        </p>
                      )}
                      {/* Status */}
                      {node.task.status && (
                        <p className="text-xs font-medium text-muted-foreground mt-auto">
                          Status: {node.task.status}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
