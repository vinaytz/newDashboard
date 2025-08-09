import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import Input from '../../components/UI/Input';

const Timer: React.FC = () => {
  const { settings, addTimerSession, setTimerState, isTimerRunning, currentTimer } = useApp();
  const [timeLeft, setTimeLeft] = useState(settings.pomodoroWorkDuration * 60);
  const [timerType, setTimerType] = useState<'pomodoro' | 'break' | 'stopwatch'>('pomodoro');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [customTime, setCustomTime] = useState({ minutes: 25, seconds: 0 });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    if (timerType === 'pomodoro') {
      setTimeLeft(settings.pomodoroWorkDuration * 60);
    } else if (timerType === 'break') {
      setTimeLeft(settings.pomodoroBreakDuration * 60);
    } else {
      setTimeLeft(0);
    }
  }, [settings, timerType]);

  useEffect(() => {
    if (isTimerRunning) {
      setTimerState(true, { type: timerType, timeLeft, category });
    } else {
      setTimerState(false);
    }
  }, [isTimerRunning, timerType, timeLeft, category, setTimerState]);

  const startTimer = () => {
    startTimeRef.current = new Date();
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (timerType === 'stopwatch') {
          return prev + 1;
        } else {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        }
      });
    }, 1000);
    setTimerState(true, { type: timerType, timeLeft, category });
  };

  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimerState(false);
  };

  const resetTimer = () => {
    pauseTimer();
    if (timerType === 'pomodoro') {
      setTimeLeft(settings.pomodoroWorkDuration * 60);
    } else if (timerType === 'break') {
      setTimeLeft(settings.pomodoroBreakDuration * 60);
    } else {
      setTimeLeft(0);
    }
  };

  const handleTimerComplete = () => {
    if (startTimeRef.current && intervalRef.current) {
      const sessionDuration = timerType === 'stopwatch' 
        ? timeLeft 
        : (timerType === 'pomodoro' ? settings.pomodoroWorkDuration * 60 : settings.pomodoroBreakDuration * 60);
      
      addTimerSession({
        type: timerType,
        duration: sessionDuration,
        category: category || undefined,
        startedAt: startTimeRef.current.toISOString(),
        completedAt: new Date().toISOString()
      });
      
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setTimerState(false);
      
      // Auto-switch for Pomodoro
      if (timerType === 'pomodoro') {
        setTimerType('break');
        setTimeLeft(settings.pomodoroBreakDuration * 60);
      } else if (timerType === 'break') {
        setTimerType('pomodoro');
        setTimeLeft(settings.pomodoroWorkDuration * 60);
      }
    }
  };

  const setCustomTimer = () => {
    const totalSeconds = (customTime.minutes * 60) + customTime.seconds;
    setTimeLeft(totalSeconds);
    setIsSettingsOpen(false);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerTitle = () => {
    switch (timerType) {
      case 'pomodoro':
        return 'Pomodoro Timer';
      case 'break':
        return 'Break Timer';
      case 'stopwatch':
        return 'Stopwatch';
      default:
        return 'Timer';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Timer</h1>
        <p className="text-gray-400 mt-2">Stay focused with the Pomodoro technique or use a custom timer.</p>
      </div>

      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{getTimerTitle()}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsSettingsOpen(true)}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            {/* Timer Display */}
            <div className="text-6xl font-mono font-bold text-gray-100 mb-6">
              {formatTime(timeLeft)}
            </div>

            {/* Category Input */}
            <div className="mb-4">
              <Input
                placeholder="Category (optional)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="text-center"
              />
            </div>

            {/* Timer Type Buttons */}
            <div className="flex justify-center space-x-2 mb-6">
              <Button
                variant={timerType === 'pomodoro' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => {
                  setTimerType('pomodoro');
                  resetTimer();
                }}
              >
                Pomodoro
              </Button>
              <Button
                variant={timerType === 'break' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => {
                  setTimerType('break');
                  resetTimer();
                }}
              >
                Break
              </Button>
              <Button
                variant={timerType === 'stopwatch' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => {
                  setTimerType('stopwatch');
                  resetTimer();
                }}
              >
                Stopwatch
              </Button>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center space-x-4">
              <Button
                variant="primary"
                onClick={isTimerRunning ? pauseTimer : startTimer}
                className="px-8"
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={resetTimer}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Timer Settings"
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Custom Timer</h3>
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder="Minutes"
                value={customTime.minutes}
                onChange={(e) => setCustomTime(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
                min="0"
                max="180"
              />
              <Input
                type="number"
                placeholder="Seconds"
                value={customTime.seconds}
                onChange={(e) => setCustomTime(prev => ({ ...prev, seconds: parseInt(e.target.value) || 0 }))}
                min="0"
                max="59"
              />
            </div>
            <Button onClick={setCustomTimer} className="w-full mt-2" size="sm">
              Set Custom Time
            </Button>
          </div>
          
          <div className="pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              Current Settings:
            </p>
            <p className="text-sm text-gray-300">
              Pomodoro: {settings.pomodoroWorkDuration} min
            </p>
            <p className="text-sm text-gray-300">
              Break: {settings.pomodoroBreakDuration} min
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Timer;