import React from 'react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { CheckSquare, Target, Calendar, Timer, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/UI/Card';
import ProgressBar from '../../components/UI/ProgressBar';

const Overview: React.FC = () => {
  const { tasks, goals, reminders, timetableSlots, timerSessions, isTimerRunning } = useApp();

  // Today's tasks
  const todayTasks = tasks.filter(task => 
    task.dueDate && isToday(parseISO(task.dueDate))
  );
  
  const completedTodayTasks = todayTasks.filter(task => task.status === 'completed');

  // Upcoming deadlines
  const upcomingDeadlines = [...tasks, ...reminders]
    .filter(item => item.dueDate && new Date(item.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  // Active goals
  const activeGoals = goals.filter(goal => goal.status === 'active');

  // Today's schedule
  const today = format(new Date(), 'EEEE').toLowerCase();
  const todaySchedule = timetableSlots
    .filter(slot => slot.day === format(new Date(), 'EEEE').toLowerCase())
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Recent timer sessions (today)
  const todayTimerSessions = timerSessions.filter(session => 
    isToday(parseISO(session.startedAt))
  );

  const totalPomodoroTime = todayTimerSessions
    .filter(session => session.type === 'pomodoro')
    .reduce((total, session) => total + session.duration, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <CheckSquare className="h-8 w-8 text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Today's Tasks</p>
              <div className="text-2xl font-bold text-gray-100">
                {completedTodayTasks.length}/{todayTasks.length}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Target className="h-8 w-8 text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Active Goals</p>
              <div className="text-2xl font-bold text-gray-100">{activeGoals.length}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Timer className="h-8 w-8 text-orange-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Focus Time Today</p>
              <div className="text-2xl font-bold text-gray-100">
                {Math.round(totalPomodoroTime / 60)}m
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-purple-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Completion Rate</p>
              <div className="text-2xl font-bold text-gray-100">
                {todayTasks.length > 0 
                  ? Math.round((completedTodayTasks.length / todayTasks.length) * 100)
                  : 0
                }%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckSquare className="h-5 w-5 mr-2 text-blue-400" />
              Today's Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayTasks.length === 0 ? (
              <p className="text-gray-400 text-sm">No tasks due today</p>
            ) : (
              <div className="space-y-3">
                {todayTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      task.status === 'completed' ? 'bg-green-500' : 
                      task.priority === 'high' ? 'bg-red-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${
                        task.status === 'completed' 
                          ? 'text-gray-400 line-through' 
                          : 'text-gray-200'
                      }`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">{task.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-green-400" />
              Active Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeGoals.length === 0 ? (
              <p className="text-gray-400 text-sm">No active goals</p>
            ) : (
              <div className="space-y-4">
                {activeGoals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-200 truncate">{goal.title}</p>
                      <span className="text-xs text-gray-400">{goal.progress}%</span>
                    </div>
                    <ProgressBar value={goal.progress} />
                    <p className="text-xs text-gray-400">
                      Due {format(parseISO(goal.targetDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-400" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaySchedule.length === 0 ? (
              <p className="text-gray-400 text-sm">No scheduled activities today</p>
            ) : (
              <div className="space-y-3">
                {todaySchedule.map((slot) => (
                  <div key={slot.id} className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: slot.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200">{slot.title}</p>
                      <p className="text-xs text-gray-400">
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-red-400" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-gray-400 text-sm">No upcoming deadlines</p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">{item.title}</p>
                      <p className="text-xs text-gray-400">
                        {'category' in item ? item.category : 'Reminder'}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {isTomorrow(parseISO(item.dueDate!)) 
                        ? 'Tomorrow' 
                        : format(parseISO(item.dueDate!), 'MMM dd')
                      }
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;