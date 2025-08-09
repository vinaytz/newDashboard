import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, MoreHorizontal } from 'lucide-react';
import { Task } from '../../types';
import Button from './Button';
import { Card, CardContent, CardHeader, CardTitle } from './Card';

interface KanbanColumn {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  onTaskMove: (taskId: string, fromColumn: string, toColumn: string) => void;
  onTaskClick: (task: Task) => void;
  onAddTask: (columnId: string) => void;
}

interface SortableTaskProps {
  task: Task;
  onClick: (task: Task) => void;
}

const SortableTask: React.FC<SortableTaskProps> = ({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-gray-800 border border-gray-700 rounded-lg p-3 mb-2 cursor-pointer hover:bg-gray-700 transition-colors border-l-4 ${getPriorityColor(task.priority)}`}
      onClick={() => onClick(task)}
    >
      <h4 className="font-medium text-gray-100 text-sm mb-1">{task.title}</h4>
      {task.description && (
        <p className="text-xs text-gray-400 mb-2 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            task.category === 'work' ? 'bg-blue-500/20 text-blue-400' :
            task.category === 'personal' ? 'bg-green-500/20 text-green-400' :
            task.category === 'learning' ? 'bg-purple-500/20 text-purple-400' :
            task.category === 'health' ? 'bg-red-500/20 text-red-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {task.category}
          </span>
        </div>
        {task.dueDate && (
          <span className="text-xs text-gray-400">
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  columns,
  onTaskMove,
  onTaskClick,
  onAddTask,
}) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const task = columns
      .flatMap(col => col.tasks)
      .find(task => task.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeTaskId = active.id as string;
    const overColumnId = over.id as string;
    
    // Find the source column
    const sourceColumn = columns.find(col => 
      col.tasks.some(task => task.id === activeTaskId)
    );
    
    if (sourceColumn && sourceColumn.id !== overColumnId) {
      onTaskMove(activeTaskId, sourceColumn.id, overColumnId);
    }
    
    setActiveTask(null);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex space-x-6 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <span>{column.title}</span>
                    <span className="text-sm text-gray-400 font-normal">
                      ({column.tasks.length})
                    </span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddTask(column.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <SortableContext
                  items={column.tasks.map(task => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="min-h-[200px]">
                    {column.tasks.map((task) => (
                      <SortableTask
                        key={task.id}
                        task={task}
                        onClick={onTaskClick}
                      />
                    ))}
                  </div>
                </SortableContext>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      
      <DragOverlay>
        {activeTask ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg rotate-3">
            <h4 className="font-medium text-gray-100 text-sm">{activeTask.title}</h4>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;