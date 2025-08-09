import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp, Clock, Target, BarChart3, PieChart } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval, parseISO } from 'date-fns';
import { useApp } from '../../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { 
  ProductivityLineChart, 
  FocusTimeAreaChart, 
  CategoryBarChart, 
  GoalProgressPieChart,
  RadialProgressChart 
} from '../../components/UI/Charts';

const Analytics: React.FC = () => {
  const { tasks, goals, timerSessions } = useApp();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'productivity' | 'focus' | 'goals' | 'categories'>('productivity');

  const dateRange = useMemo(() => {
    const end = new Date();
    let start: Date;
    
    switch (timeRange) {
      case '7d':
        start = subDays(end, 7);
        break;
      case '30d':
        start = subDays(end, 30);
        break;
      case '90d':
        start = subDays(end, 90);
        break;
      case '1y':
        start = subDays(end, 365);
        break;
      default:
        start = subDays(end, 30);
    }
    
    return { start, end };
  }, [timeRange]);

  // Productivity metrics
  const productivityData = useMemo(() => {
    const days = eachDayOfInterval(dateRange);
    
    return days.map(day => {
      const dayTasks = tasks.filter(task => {
        const createdDate = parseISO(task.createdAt);
        const completedDate = task.completedAt ? parseISO(task.completedAt) : null;
        
        return format(createdDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') ||
               (completedDate && format(completedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
      });
      
      const created = dayTasks.filter(task => 
        format(parseISO(task.createdAt), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      ).length;
      
      const completed = dayTasks.filter(task => 
        task.completedAt && format(parseISO(task.completedAt), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      ).length;
      
      return {
        date: format(day, 'MMM dd'),
        created,
        completed,
        completionRate: created > 0 ? (completed / created) * 100 : 0
      };
    });
  }, [tasks, dateRange]);

  // Focus time data
  const focusTimeData = useMemo(() => {
    const days = eachDayOfInterval(dateRange);
    
    return days.map(day => {
      const daySessions = timerSessions.filter(session => {
        const sessionDate = parseISO(session.startedAt);
        return format(sessionDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') &&
               session.type === 'pomodoro';
      });
      
      const focusTime = daySessions.reduce((total, session) => total + (session.duration / 60), 0);
      
      return {
        date: format(day, 'MMM dd'),
        focusTime: Math.round(focusTime)
      };
    });
  }, [timerSessions, dateRange]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const filteredTasks = tasks.filter(task => {
      const taskDate = parseISO(task.createdAt);
      return isWithinInterval(taskDate, dateRange);
    });
    
    const categoryMap = new Map();
    
    filteredTasks.forEach(task => {
      const sessions = timerSessions.filter(session => session.taskId === task.id);
      const totalTime = sessions.reduce((sum, session) => sum + (session.duration / 60), 0);
      
      if (categoryMap.has(task.category)) {
        categoryMap.set(task.category, categoryMap.get(task.category) + totalTime);
      } else {
        categoryMap.set(task.category, totalTime);
      }
    });
    
    return Array.from(categoryMap.entries()).map(([category, time]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      time: Math.round(time)
    }));
  }, [tasks, timerSessions, dateRange]);

  // Goal progress data
  const goalProgressData = useMemo(() => {
    const statusMap = new Map();
    
    goals.forEach(goal => {
      if (statusMap.has(goal.status)) {
        statusMap.set(goal.status, statusMap.get(goal.status) + 1);
      } else {
        statusMap.set(goal.status, 1);
      }
    });
    
    return Array.from(statusMap.entries()).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
  }, [goals]);

  // Summary statistics
  const stats = useMemo(() => {
    const filteredTasks = tasks.filter(task => {
      const taskDate = parseISO(task.createdAt);
      return isWithinInterval(taskDate, dateRange);
    });
    
    const completedTasks = filteredTasks.filter(task => task.status === 'completed');
    const totalFocusTime = timerSessions
      .filter(session => {
        const sessionDate = parseISO(session.startedAt);
        return isWithinInterval(sessionDate, dateRange) && session.type === 'pomodoro';
      })
      .reduce((total, session) => total + session.duration, 0);
    
    const activeGoals = goals.filter(goal => goal.status === 'active');
    const avgGoalProgress = activeGoals.length > 0 
      ? activeGoals.reduce((sum, goal) => sum + goal.progress, 0) / activeGoals.length 
      : 0;
    
    return {
      tasksCompleted: completedTasks.length,
      tasksCreated: filteredTasks.length,
      completionRate: filteredTasks.length > 0 ? (completedTasks.length / filteredTasks.length) * 100 : 0,
      totalFocusTime: Math.round(totalFocusTime / 60), // in minutes
      avgSessionLength: timerSessions.length > 0 
        ? Math.round(timerSessions.reduce((sum, s) => sum + s.duration, 0) / timerSessions.length / 60)
        : 0,
      activeGoals: activeGoals.length,
      avgGoalProgress: Math.round(avgGoalProgress),
      productivityScore: Math.round((
        (completedTasks.length * 0.4) +
        (totalFocusTime / 3600 * 0.3) + // hours to score
        (avgGoalProgress * 0.3)
      ))
    };
  }, [tasks, timerSessions, goals, dateRange]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Analytics</h1>
          <p className="text-gray-400 mt-2">
            Insights into your productivity patterns and goal achievement.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-700 rounded-lg p-1">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === '1y' ? '1 Year' : range.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Productivity Score</p>
              <div className="text-2xl font-bold text-gray-100">{stats.productivityScore}</div>
              <p className="text-xs text-gray-400">Based on tasks & focus time</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <BarChart3 className="h-8 w-8 text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Tasks Completed</p>
              <div className="text-2xl font-bold text-gray-100">{stats.tasksCompleted}</div>
              <p className="text-xs text-gray-400">
                {stats.completionRate.toFixed(1)}% completion rate
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-purple-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Focus Time</p>
              <div className="text-2xl font-bold text-gray-100">{stats.totalFocusTime}m</div>
              <p className="text-xs text-gray-400">
                Avg {stats.avgSessionLength}m per session
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Target className="h-8 w-8 text-orange-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Goal Progress</p>
              <div className="text-2xl font-bold text-gray-100">{stats.avgGoalProgress}%</div>
              <p className="text-xs text-gray-400">
                {stats.activeGoals} active goals
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-2">
            {[
              { key: 'productivity', label: 'Productivity', icon: TrendingUp },
              { key: 'focus', label: 'Focus Time', icon: Clock },
              { key: 'categories', label: 'Categories', icon: BarChart3 },
              { key: 'goals', label: 'Goals', icon: Target },
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={selectedMetric === key ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedMetric(key as any)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedMetric === 'productivity' && 'Productivity Trends'}
              {selectedMetric === 'focus' && 'Focus Time Over Time'}
              {selectedMetric === 'categories' && 'Time by Category'}
              {selectedMetric === 'goals' && 'Goal Status Distribution'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMetric === 'productivity' && (
              <ProductivityLineChart data={productivityData} />
            )}
            {selectedMetric === 'focus' && (
              <FocusTimeAreaChart data={focusTimeData} />
            )}
            {selectedMetric === 'categories' && (
              <CategoryBarChart data={categoryData} />
            )}
            {selectedMetric === 'goals' && (
              <GoalProgressPieChart data={goalProgressData} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Summary */}
        <Card>
          <CardHeader>
            <CardTitle>This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Tasks Completed</span>
                <span className="font-medium text-gray-100">
                  {tasks.filter(task => {
                    if (!task.completedAt) return false;
                    const completedDate = parseISO(task.completedAt);
                    const weekStart = startOfWeek(new Date());
                    const weekEnd = endOfWeek(new Date());
                    return isWithinInterval(completedDate, { start: weekStart, end: weekEnd });
                  }).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Focus Sessions</span>
                <span className="font-medium text-gray-100">
                  {timerSessions.filter(session => {
                    const sessionDate = parseISO(session.startedAt);
                    const weekStart = startOfWeek(new Date());
                    const weekEnd = endOfWeek(new Date());
                    return isWithinInterval(sessionDate, { start: weekStart, end: weekEnd }) &&
                           session.type === 'pomodoro';
                  }).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Goals Updated</span>
                <span className="font-medium text-gray-100">
                  {goals.filter(goal => {
                    const updatedDate = parseISO(goal.updatedAt);
                    const weekStart = startOfWeek(new Date());
                    const weekEnd = endOfWeek(new Date());
                    return isWithinInterval(updatedDate, { start: weekStart, end: weekEnd });
                  }).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryData
                .sort((a, b) => b.time - a.time)
                .slice(0, 5)
                .map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-yellow-500' :
                        index === 3 ? 'bg-purple-500' :
                        'bg-gray-500'
                      }`} />
                      <span className="text-gray-300">{category.category}</span>
                    </div>
                    <span className="font-medium text-gray-100">{category.time}m</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievement Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-2">
                  <RadialProgressChart
                    value={stats.completionRate}
                    max={100}
                    color="#10B981"
                  />
                </div>
                <p className="text-sm text-gray-400">Task Completion Rate</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Longest Focus Session</span>
                  <span className="text-gray-100">
                    {timerSessions.length > 0 
                      ? Math.round(Math.max(...timerSessions.map(s => s.duration)) / 60)
                      : 0
                    }m
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Goals Completed</span>
                  <span className="text-gray-100">
                    {goals.filter(g => g.status === 'completed').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Current Streak</span>
                  <span className="text-gray-100">5 days</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;