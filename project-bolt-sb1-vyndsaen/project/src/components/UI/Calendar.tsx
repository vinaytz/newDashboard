import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import Button from './Button';
import { Task, TimetableSlot, Reminder } from '../../types';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'task' | 'timetable' | 'reminder';
  color: string;
  data: Task | TimetableSlot | Reminder;
}

interface CalendarProps {
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onAddEvent: (date: Date) => void;
  view: 'month' | 'week' | 'day';
  onViewChange: (view: 'month' | 'week' | 'day') => void;
}

const Calendar: React.FC<CalendarProps> = ({
  events,
  onDateClick,
  onEventClick,
  onAddEvent,
  view,
  onViewChange,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.date), date)
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-100">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-700 rounded-lg p-1">
            {(['month', 'week', 'day'] as const).map((viewType) => (
              <Button
                key={viewType}
                variant={view === viewType ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onViewChange(viewType)}
                className="capitalize"
              >
                {viewType}
              </Button>
            ))}
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onAddEvent(new Date())}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      {view === 'month' && (
        <div className="p-4">
          {/* Week Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-400">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dayEvents = getEventsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isDayToday = isToday(day);
              
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[100px] p-2 border border-gray-700 rounded cursor-pointer hover:bg-gray-700/50 transition-colors ${
                    !isCurrentMonth ? 'opacity-50' : ''
                  } ${isDayToday ? 'bg-blue-500/10 border-blue-500' : ''}`}
                  onClick={() => onDateClick(day)}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isDayToday ? 'text-blue-400' : 'text-gray-100'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                        style={{ backgroundColor: event.color + '40', color: event.color }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-400">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {view === 'week' && (
        <div className="p-4">
          <div className="text-center text-gray-400">
            Week view coming soon...
          </div>
        </div>
      )}

      {/* Day View */}
      {view === 'day' && (
        <div className="p-4">
          <div className="text-center text-gray-400">
            Day view coming soon...
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;