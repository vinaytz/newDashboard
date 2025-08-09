import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Grid, List, Calendar, MoreHorizontal, Tag, Clock, User, Flag } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';
import { useApp } from '../../context/AppContext';
import { Task, SubTask } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Modal from '../../components/UI/Modal';
import { DataTable } from '../../components/UI/DataTable';
import KanbanBoard from '../../components/UI/KanbanBoard';
import Calendar from '../../components/UI/Calendar';

const MyTasks: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'todo' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | Task['category']>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | Task['priority']>('all');
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'calendar' | 'table'>('list');
  const [showCompleted, setShowCompleted] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal' as Task['category'],
    priority: 'medium' as Task['priority'],
    dueDate: '',
    startDate: '',
    estimatedTime: '',
    tags: [] as string[],
    subtasks: [] as SubTask[]
  });
  
  const [newTag, setNewTag] = useState('');
  const [newSubtask, setNewSubtask] = useState('');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesCompleted = showCompleted || task.status !== 'completed';
      
      return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesCompleted;
    }).sort((a, b) => {
      // Sort by due date, then priority
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [tasks, searchTerm, filterStatus, filterCategory]);

  // Kanban columns
  const kanbanColumns = [
    { id: 'todo', title: 'To Do', tasks: filteredTasks.filter(t => t.status === 'todo'), color: '#6B7280' },
    { id: 'in-progress', title: 'In Progress', tasks: filteredTasks.filter(t => t.status === 'in-progress'), color: '#3B82F6' },
    { id: 'completed', title: 'Completed', tasks: filteredTasks.filter(t => t.status === 'completed'), color: '#10B981' },
    { id: 'on-hold', title: 'On Hold', tasks: filteredTasks.filter(t => t.status === 'on-hold'), color: '#F59E0B' },
  ];

  // Table columns
  const tableColumns: ColumnDef<Task>[] = [
    {
      accessorKey: 'title',
      header: 'Task',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleTaskStatus(row.original)}
            className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
              row.original.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-500'
            }`}
          >
            {row.original.status === 'completed' && (
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <div>
            <div className="font-medium">{row.original.title}</div>
            {row.original.description && (
              <div className="text-sm text-gray-400 truncate max-w-xs">{row.original.description}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.original.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
          row.original.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
          row.original.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-green-500/20 text-green-400'
        }`}>
          {row.original.priority}
        </span>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="capitalize text-gray-300">{row.original.category}</span>
      ),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => (
        row.original.dueDate ? (
          <span className="text-gray-300">
            {format(parseISO(row.original.dueDate), 'MMM dd, yyyy')}
          </span>
        ) : (
          <span className="text-gray-500">No due date</span>
        )
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`capitalize ${getStatusColor(row.original.status)}`}>
          {row.original.status.replace('-', ' ')}
        </span>
      ),
    },
  ];
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTask) {
      updateTask(editingTask.id, {
        ...formData,
        dueDate: formData.dueDate || undefined,
        startDate: formData.startDate || undefined,
        estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined,
        tags: formData.tags,
        subtasks: formData.subtasks,
        updatedAt: new Date().toISOString()
      });
    } else {
      addTask({
        ...formData,
        status: 'todo',
        dueDate: formData.dueDate || undefined,
        startDate: formData.startDate || undefined,
        estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined,
        tags: formData.tags,
        subtasks: formData.subtasks,
        attachments: [],
        comments: [],
        dependencies: [],
        updatedAt: new Date().toISOString()
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'personal',
      priority: 'medium',
      dueDate: '',
      startDate: '',
      estimatedTime: '',
      tags: [],
      subtasks: []
    });
    setEditingTask(null);
    setIsModalOpen(false);
    setNewTag('');
    setNewSubtask('');
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate ? format(parseISO(task.dueDate), 'yyyy-MM-dd') : '',
      startDate: task.startDate ? format(parseISO(task.startDate), 'yyyy-MM-dd') : '',
      estimatedTime: task.estimatedTime?.toString() || '',
      tags: task.tags || [],
      subtasks: task.subtasks || []
    });
    setIsModalOpen(true);
  };

  const toggleTaskStatus = (task: Task) => {
    let nextStatus: Task['status'];
    switch (task.status) {
      case 'todo':
        nextStatus = 'in-progress';
        break;
      case 'in-progress':
        nextStatus = 'completed';
        break;
      case 'completed':
        nextStatus = 'todo';
        break;
      default:
        nextStatus = 'todo';
    }
    
    updateTask(task.id, {
      status: nextStatus,
      completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString()
    });
  };

  const handleTaskMove = (taskId: string, fromColumn: string, toColumn: string) => {
    const statusMap: { [key: string]: Task['status'] } = {
      'todo': 'todo',
      'in-progress': 'in-progress',
      'completed': 'completed',
      'on-hold': 'on-hold'
    };
    
    updateTask(taskId, {
      status: statusMap[toColumn],
      completedAt: toColumn === 'completed' ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString()
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      const subtask: SubTask = {
        id: Date.now().toString(),
        title: newSubtask.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      };
      setFormData(prev => ({
        ...prev,
        subtasks: [...prev.subtasks, subtask]
      }));
      setNewSubtask('');
    }
  };

  const toggleSubtask = (subtaskId: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(subtask =>
        subtask.id === subtaskId
          ? { ...subtask, completed: !subtask.completed }
          : subtask
      )
    }));
  };

  const removeSubtask = (subtaskId: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(subtask => subtask.id !== subtaskId)
    }));
  };
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-500/10';
      case 'high': return 'border-red-500 bg-red-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-green-500 bg-green-500/10';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in-progress': return 'text-blue-400';
      case 'on-hold': return 'text-yellow-400';
      case 'cancelled': return 'text-red-400';
      case 'todo': return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">My Tasks</h1>
          <p className="text-gray-400 mt-2">
            Manage your tasks with advanced filtering, multiple views, and powerful organization tools.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-700 rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'board' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('board')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
              >
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
              >
                <option value="all">All Categories</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="learning">Learning</option>
                <option value="health">Health</option>
                <option value="finance">Finance</option>
                <option value="social">Social</option>
                <option value="other">Other</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <label className="flex items-center space-x-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Show completed</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Views */}
      {viewMode === 'list' && (
        <div className="grid gap-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-400">No tasks found. Create your first task!</p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card key={task.id} className={`border-l-4 ${getPriorityColor(task.priority)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleTaskStatus(task)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            task.status === 'completed' ? 'bg-green-500 border-green-500' :
                            task.status === 'in-progress' ? 'bg-blue-500 border-blue-500' :
                            'border-gray-500 hover:border-gray-400'
                          }`}
                        >
                          {task.status === 'completed' && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium ${
                            task.status === 'completed' 
                              ? 'text-gray-400 line-through' 
                              : 'text-gray-100'
                          }`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                          )}
                          <div className="flex items-center flex-wrap gap-2 mt-2 text-xs text-gray-400">
                            <span className="capitalize">{task.category}</span>
                            <span className={`capitalize ${getStatusColor(task.status)}`}>
                              {task.status.replace('-', ' ')}
                            </span>
                            <span className="capitalize">{task.priority} priority</span>
                            {task.dueDate && (
                              <span>Due {format(parseISO(task.dueDate), 'MMM dd, yyyy')}</span>
                            )}
                            {task.estimatedTime && (
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {task.estimatedTime}m
                              </span>
                            )}
                          </div>
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {task.tags.map((tag) => (
                                <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs flex items-center">
                                  <Tag className="h-2 w-2 mr-1" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="mt-2">
                              <div className="text-xs text-gray-400">
                                Subtasks: {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} completed
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(task)}>
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deleteTask(task.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {viewMode === 'board' && (
        <KanbanBoard
          columns={kanbanColumns}
          onTaskMove={handleTaskMove}
          onTaskClick={handleEdit}
          onAddTask={() => setIsModalOpen(true)}
        />
      )}

      {viewMode === 'table' && (
        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={tableColumns}
              data={filteredTasks}
              searchKey="tasks"
              onRowClick={handleEdit}
            />
          </CardContent>
        </Card>
      )}

      {viewMode === 'calendar' && (
        <div className="text-center text-gray-400 py-12">
          Calendar view coming soon...
        </div>
      )}

      {/* Add/Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingTask ? 'Edit Task' : 'Add New Task'}
      >
        <div className="max-h-96 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Enter task title"
            />
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-300">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description (optional)"
                className="block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Task['category'] })}
                  className="block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="learning">Learning</option>
                  <option value="health">Health</option>
                  <option value="finance">Finance</option>
                  <option value="social">Social</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                  className="block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date (Optional)"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
              <Input
                label="Due Date (Optional)"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            
            <Input
              label="Estimated Time (minutes)"
              type="number"
              value={formData.estimatedTime}
              onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
              placeholder="How long will this take?"
            />
            
            {/* Tags */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Tags</label>
              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs flex items-center"
                    >
                      <Tag className="h-2 w-2 mr-1" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-gray-400 hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Subtasks */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Subtasks</label>
              <div className="flex space-x-2">
                <Input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add a subtask"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                />
                <Button type="button" onClick={addSubtask} size="sm">
                  Add
                </Button>
              </div>
              {formData.subtasks.length > 0 && (
                <div className="space-y-2">
                  {formData.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => toggleSubtask(subtask.id)}
                        className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-gray-400' : 'text-gray-300'}`}>
                        {subtask.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSubtask(subtask.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">
                {editingTask ? 'Update Task' : 'Add Task'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default MyTasks;