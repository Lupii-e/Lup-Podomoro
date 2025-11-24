import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Coffee, Brain, Armchair } from 'lucide-react';
import { TimerMode, Task } from './types';
import CircularProgress from './components/CircularProgress';
import TaskList from './components/TaskList';

// Configuration
const TIMER_CONFIG = {
  [TimerMode.FOCUS]: 25 * 60,
  [TimerMode.SHORT_BREAK]: 5 * 60,
  [TimerMode.LONG_BREAK]: 15 * 60,
};

const THEME_CONFIG = {
  [TimerMode.FOCUS]: {
    bg: "from-slate-900 to-slate-800",
    accent: "text-rose-400",
    stroke: "text-rose-500",
    icon: Brain,
    label: "Deep Work"
  },
  [TimerMode.SHORT_BREAK]: {
    bg: "from-slate-900 to-emerald-900/20",
    accent: "text-emerald-400",
    stroke: "text-emerald-500",
    icon: Coffee,
    label: "Short Break"
  },
  [TimerMode.LONG_BREAK]: {
    bg: "from-slate-900 to-indigo-900/20",
    accent: "text-indigo-400",
    stroke: "text-indigo-500",
    icon: Armchair,
    label: "Decompress"
  }
};

const App: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [timeLeft, setTimeLeft] = useState(TIMER_CONFIG[TimerMode.FOCUS]);
  const [isRunning, setIsRunning] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timerSize, setTimerSize] = useState(300);

  // Sound ref (using a simple reliable beep for MVP without external assets)
  // In a real app, you might use an Audio object with a URL.
  // We will simulate a notification instead.
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(TIMER_CONFIG[newMode]);
  };

  // Responsive timer size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 380) {
        setTimerSize(240);
      } else if (window.innerWidth < 640) {
        setTimerSize(280);
      } else {
        setTimerSize(320);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // Timer finished
      setIsRunning(false);
      if (soundEnabled && "Notification" in window && Notification.permission === "granted") {
        new Notification("Luplup", { body: "Timer complete!" });
      }
      // Auto switch logic could go here, but manual is better for mindful work
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, soundEnabled]);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_CONFIG[mode]);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    const total = TIMER_CONFIG[mode];
    return timeLeft / total;
  };

  const currentTheme = THEME_CONFIG[mode];
  const Icon = currentTheme.icon;

  return (
    <div className={`h-screen w-full bg-gradient-to-b ${currentTheme.bg} transition-colors-bg duration-1000 flex flex-col items-center overflow-hidden`}>
      
      {/* Scrollable Container */}
      <div className="w-full h-full overflow-y-auto no-scrollbar flex flex-col items-center py-6 px-4 md:py-12">
        
        {/* Header / Nav */}
        <header className="w-full max-w-2xl flex justify-between items-center mb-8 md:mb-12 shrink-0">
          <h1 className="text-xl md:text-2xl font-bold tracking-tighter text-slate-200 flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${currentTheme.accent.replace('text-', 'bg-')}`}></span>
            Luplup
          </h1>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-4xl flex flex-col items-center">
          
          {/* Mode Switcher */}
          <div className="flex bg-slate-800/50 p-1 md:p-1.5 rounded-full backdrop-blur-sm mb-8 md:mb-12 border border-slate-700/50 overflow-x-auto max-w-full no-scrollbar">
            {(Object.values(TimerMode) as TimerMode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`whitespace-nowrap px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ${
                  mode === m 
                    ? 'bg-slate-700 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {THEME_CONFIG[m].label}
              </button>
            ))}
          </div>

          {/* Timer Visualization */}
          <div className="mb-8 md:mb-12 relative group shrink-0">
            <CircularProgress 
              progress={calculateProgress()} 
              size={timerSize} 
              strokeWidth={window.innerWidth < 640 ? 5 : 6}
              colorClass={currentTheme.stroke}
            >
              <div className={`font-light tracking-tighter text-slate-100 font-mono mb-2 ${timerSize < 260 ? 'text-5xl' : 'text-6xl md:text-7xl'}`}>
                {formatTime(timeLeft)}
              </div>
              <div className={`text-xs md:text-sm uppercase tracking-widest font-semibold flex items-center gap-2 ${currentTheme.accent}`}>
                <Icon size={14} />
                {isRunning ? 'Running' : 'Paused'}
              </div>
            </CircularProgress>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 mb-8 md:mb-16 shrink-0">
            <button 
              onClick={toggleTimer}
              className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                isRunning 
                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-600' 
                  : `bg-white text-slate-900 hover:scale-105 hover:shadow-xl hover:shadow-${currentTheme.accent.split('-')[1]}-500/20`
              }`}
            >
              {isRunning ? <Pause size={24} fill="currentColor" className="md:w-7 md:h-7" /> : <Play size={24} fill="currentColor" className="ml-1 md:w-7 md:h-7" />}
            </button>
            
            <button 
              onClick={resetTimer}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-all"
            >
              <RotateCcw size={18} className="md:w-5 md:h-5" />
            </button>
          </div>

          {/* Task Manager */}
          <div className="w-full pb-8">
              <TaskList tasks={tasks} setTasks={setTasks} />
          </div>

        </main>

        <footer className="mt-auto text-slate-600 text-[10px] md:text-xs py-4 shrink-0">
          Designed for Focus. Powered by Gemini.
        </footer>
      </div>
    </div>
  );
};

export default App;