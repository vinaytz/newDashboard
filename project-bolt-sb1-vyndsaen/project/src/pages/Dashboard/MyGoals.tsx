import React, { useState, useMemo } from 'react';
import { Plus, Target, TrendingUp, Calendar, CheckCircle, Circle, MoreHorizontal } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useApp } from '../../context/AppContext';
import { Goal, Milestone, GoalMetric } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Modal from '../../components/UI/Modal';
import ProgressBar from '../../components/UI/ProgressBar';
import { RadialProgressChart } from '../../components/UI/Charts';

const MyGoals: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal, tasks } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'paused' | 'cancelled'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | Goal['category']>('all');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal' as Goal['category'],
    type: 'outcome' as Goal['type'],
    targetDate: '',
    milestones: [] as Milestone[],
    metrics: [] as GoalMetric[]
  });
  
  const [newMilestone, setNewMilestone] = useState({ title: '', targetDate: '' });
  const [newMetric, setNewMetric] = useState({ name: '', unit: '', targetValue: '' });

  const filteredGoals = useMemo(() => {
    return goals.filter(goal => {
      const matchesStatus = filterStatus === 'all' || goal.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || goal.category === filterCategory;
      return matchesStatus && matchesCategory;
    }).sort((a, b) => {
      // Sort by target date, then by progress
      if (a.targetDate && b.targetDate) {
        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
      }
      return b.progress - a.progress;
    });
  }, [goals, filterStatus, filterCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGoal) {
      updateGoal(editingGoal.id, {
        ...formData,
        updatedAt: new Date().toISOString()
      });
    } else {
      addGoal({
        ...formData,
        progress: 0,
        status: 'active',
        linkedTasks: []
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'personal',
      type: 'outcome',
      targetDate: '',
      milestones: [],
      metrics: []
    });
    setEditingGoal(null);
    setIsModalOpen(false);
    setNewMilestone({ title: '', targetDate: '' });
    setNewMetric({ name: '', unit: '', targetValue: '' });
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      category: goal.category,
      type: goal.type,
      targetDate: format(parseISO(goal.targetDate), 'yyyy-MM-dd'),
      milestones: goal.milestones || [],
      metrics: goal.metrics || []
    });
    setIsModalOpen(true);
  };

  const updateGoalProgress = (goalId: string, progress: number) => {
    updateGoal(goalId, {
      progress: Math.min(100, Math.max(0, progress)),
      status: progress >= 100 ? 'completed' : 'active',
      completedAt: progress >= 100 ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString()
    });
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedMilestones = goal.milestones.map(milestone =>
      milestone.id === milestoneId
        ? {
            ...milestone,
            completed: !milestone.completed,
            completedAt: !milestone.completed ? new Date().toISOString() : undefined
          }
        : milestone
    );

    const completedMilestones = updatedMilestones.filter(m => m.completed).length;
    const totalMilestones = updatedMilestones.length;
    const newProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : goal.progress;

    updateGoal(goalId, {
      milestones: updatedMilestones,
      progress: newProgress,
      updatedAt: new Date().toISOString()
    });
  };

  const addMilestone = () => {
    if (newMilestone.title.trim() && newMilestone.targetDate) {
      const milestone: Milestone = {
        id: Date.now().toString(),
        title: newMilestone.title.trim(),
        targetDate: newMilestone.targetDate,
        completed: false
      };
      setFormData(prev => ({
        ...prev,
        milestones: [...prev.milestones, milestone]
      }));
      setNewMilestone({ title: '', targetDate: '' });
    }
  };

  const removeMilestone = (milestoneId: string) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter(m => m.id !== milestoneId)
    }));
  };

  const addMetric = () => {
    if (newMetric.name.trim() && newMetric.unit.trim() && newMetric.targetValue) {
      const metric: GoalMetric = {
        id: Date.now().toString(),
        name: newMetric.name.trim(),
        unit: newMetric.unit.trim(),
        targetValue: parseFloat(newMetric.targetValue),
        currentValue: 0,
        trackingType: 'manual'
      };
      setFormData(prev => ({
        ...prev,
        metrics: [...prev.metrics, metric]
      }));
      setNewMetric({ name: '', unit: '', targetValue: '' });
    }
  };

  const removeMetric = (metricId: string) => {
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics.filter(m => m.id !== metricId)
    }));
  };

  const getLinkedTasks = (goalId: string) => {
    return tasks.filter(task => task.goalId === goalId);
  };

  const getDaysUntilTarget = (targetDate: string) => {
    return differenceInDays(parseISO(targetDate), new Date());
  };

  const getCategoryColor = (category: Goal['category']) => {
    switch (category) {
      case 'career': return '#3B82F6';
      case 'health': return '#EF4444';
      case 'education': return '#8B5CF6';
      case 'personal': return '#10B981';
      case 'financial': return '#F59E0B';
      case 'relationships': return '#EC4899';
      case 'travel': return '#06B6D4';
      case 'skills': return '#84CC16';
      default: return '#6B7280';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">My Goals</h1>
          <p className="text-gray-400 mt-2">
            Track your long-term objectives and measure progress with milestones and metrics.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <Target className="h-8 w-8 text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Active Goals</p>
              <div className="text-2xl font-bold text-gray-100">
                {goals.filter(g => g.status === 'active').length}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="h-8 w-8 text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Completed</p>
              <div className="text-2xl font-bold text-gray-100">
                {goals.filter(g => g.status === 'completed').length}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-purple-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Avg Progress</p>
              <div className="text-2xl font-bold text-gray-100">
                {goals.length > 0 
                  ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
                  : 0
                }%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Calendar className="h-8 w-8 text-orange-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Due This Month</p>
              <div className="text-2xl font-bold text-gray-100">
                {goals.filter(g => {
                  const daysUntil = getDaysUntilTarget(g.targetDate);
                  return daysUntil >= 0 && daysUntil <= 30;
                }).length}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
              >
                <option value="all">All Categories</option>
                <option value="career">Career</option>
                <option value="health">Health</option>
                <option value="education">Education</option>
                <option value="personal">Personal</option>
                <option value="financial">Financial</option>
                <option value="relationships">Relationships</option>
                <option value="travel">Travel</option>
                <option value="skills">Skills</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredGoals.length === 0 ? (
          <Card className="lg:col-span-2">
            <CardContent className="text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No goals found. Create your first goal to get started!</p>
            </CardContent>
          </Card>
        ) : (
          filteredGoals.map((goal) => {
            const linkedTasks = getLinkedTasks(goal.id);
            const daysUntilTarget = getDaysUntilTarget(goal.targetDate);
            const categoryColor = getCategoryColor(goal.category);
            
            return (
              <Card key={goal.id} className="border-l-4" style={{ borderLeftColor: categoryColor }}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center space-x-2">
                        <span>{goal.title}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          goal.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          goal.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                          goal.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {goal.status}
                        </span>
                      </CardTitle>
                      {goal.description && (
                        <p className="text-sm text-gray-400 mt-1">{goal.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-16">
                        <RadialProgressChart
                          value={goal.progress}
                          max={100}
                          color={categoryColor}
                        />
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(goal)}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Progress</span>
                        <span className="text-sm font-medium text-gray-100">{Math.round(goal.progress)}%</span>
                      </div>
                      <ProgressBar value={goal.progress} />
                      <div className="flex items-center justify-between mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateGoalProgress(goal.id, goal.progress - 10)}
                          disabled={goal.progress <= 0}
                        >
                          -10%
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateGoalProgress(goal.id, goal.progress + 10)}
                          disabled={goal.progress >= 100}
                        >
                          +10%
                        </Button>
                      </div>
                    </div>

                    {/* Goal Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Category:</span>
                        <span className="ml-2 text-gray-100 capitalize">{goal.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Type:</span>
                        <span className="ml-2 text-gray-100 capitalize">{goal.type}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Target Date:</span>
                        <span className="ml-2 text-gray-100">
                          {format(parseISO(goal.targetDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Days Left:</span>
                        <span className={`ml-2 font-medium ${
                          daysUntilTarget < 0 ? 'text-red-400' :
                          daysUntilTarget <= 7 ? 'text-yellow-400' :
                          'text-gray-100'
                        }`}>
                          {daysUntilTarget < 0 ? 'Overdue' : `${daysUntilTarget} days`}
                        </span>
                      </div>
                    </div>

                    {/* Milestones */}
                    {goal.milestones && goal.milestones.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Milestones</h4>
                        <div className="space-y-2">
                          {goal.milestones.slice(0, 3).map((milestone) => (
                            <div key={milestone.id} className="flex items-center space-x-2">
                              <button
                                onClick={() => toggleMilestone(goal.id, milestone.id)}
                                className={`flex-shrink-0 ${
                                  milestone.completed ? 'text-green-400' : 'text-gray-400'
                                }`}
                              >
                                {milestone.completed ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <Circle className="h-4 w-4" />
                                )}
                              </button>
                              <span className={`text-sm flex-1 ${
                                milestone.completed ? 'line-through text-gray-400' : 'text-gray-300'
                              }`}>
                                {milestone.title}
                              </span>
                              <span className="text-xs text-gray-400">
                                {format(parseISO(milestone.targetDate), 'MMM dd')}
                              </span>
                            </div>
                          ))}
                          {goal.milestones.length > 3 && (
                            <p className="text-xs text-gray-400">
                              +{goal.milestones.length - 3} more milestones
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Linked Tasks */}
                    {linkedTasks.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">
                          Linked Tasks ({linkedTasks.length})
                        </h4>
                        <div className="text-xs text-gray-400">
                          {linkedTasks.filter(t => t.status === 'completed').length} completed
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between pt-2 border-t border-gray-700">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(goal)}>
                        Edit Goal
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteGoal(goal.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add/Edit Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingGoal ? 'Edit Goal' : 'Add New Goal'}
      >
        <div className="max-h-96 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Goal Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Enter your goal"
            />
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-300">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your goal in detail"
                className="block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Goal['category'] })}
                  className="block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="career">Career</option>
                  <option value="health">Health</option>
                  <option value="education">Education</option>
                  <option value="personal">Personal</option>
                  <option value="financial">Financial</option>
                  <option value="relationships">Relationships</option>
                  <option value="travel">Travel</option>
                  <option value="skills">Skills</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Goal['type'] })}
                  className="block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="outcome">Outcome Goal</option>
                  <option value="habit">Habit Goal</option>
                  <option value="milestone">Milestone Goal</option>
                </select>
              </div>
            </div>
            
            <Input
              label="Target Date"
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              required
            />
            
            {/* Milestones */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Milestones</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  placeholder="Milestone title"
                />
                <Input
                  type="date"
                  value={newMilestone.targetDate}
                  onChange={(e) => setNewMilestone({ ...newMilestone, targetDate: e.target.value })}
                />
              </div>
              <Button type="button" onClick={addMilestone} size="sm" className="w-full">
                Add Milestone
              </Button>
              {formData.milestones.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {formData.milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                      <div className="flex-1">
                        <div className="text-sm text-gray-100">{milestone.title}</div>
                        <div className="text-xs text-gray-400">
                          {format(parseISO(milestone.targetDate), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMilestone(milestone.id)}
                        className="text-red-400 hover:text-red-300"
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
                {editingGoal ? 'Update Goal' : 'Add Goal'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default MyGoals;