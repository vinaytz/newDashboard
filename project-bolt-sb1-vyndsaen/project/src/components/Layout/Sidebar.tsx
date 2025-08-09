import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  BarChart3, 
  Calendar, 
  Timer, 
  StickyNote, 
  Bell, 
  User, 
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const { isTimerRunning, currentTimer } = useApp();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Tasks', href: '/dashboard/mytasks', icon: CheckSquare },
    { name: 'My Goals', href: '/dashboard/mygoals', icon: Target },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Timetable', href: '/dashboard/timetable', icon: Calendar },
    { name: 'Timer', href: '/dashboard/timer', icon: Timer },
    { name: 'Notes', href: '/dashboard/notes', icon: StickyNote },
    { name: 'Reminders', href: '/dashboard/reminders', icon: Bell },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
          Moxoz
        </h1>
        <p className="text-gray-400 text-sm mt-1">Personal Dashboard</p>
      </div>

      {/* Timer Status */}
      {isTimerRunning && currentTimer && (
        <div className="mx-4 mt-4 p-3 bg-blue-600/20 border border-blue-600/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Timer className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-400 capitalize">{currentTimer.type}</span>
            </div>
            <span className="text-sm font-mono text-blue-400">
              {formatTime(currentTimer.timeLeft)}
            </span>
          </div>
          {currentTimer.category && (
            <p className="text-xs text-gray-400 mt-1">{currentTimer.category}</p>
          )}
        </div>
      )}

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;