import React, { useState } from 'react';
import { Plus, Trash2, Check, Sparkles, Loader2 } from 'lucide-react';
import { Task } from '../types';
import { generateSubtasks } from '../services/geminiService';

interface TaskListProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, setTasks }) => {
  const [newTaskInput, setNewTaskInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const addTask = (title: string) => {
    if (!title.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskInput('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleGenerateAI = async () => {
    if (!newTaskInput.trim()) return;
    
    setIsGenerating(true);
    try {
      const subtasks = await generateSubtasks(newTaskInput);
      if (subtasks.length > 0) {
        const newTasks = subtasks.map(t => ({
          id: crypto.randomUUID(),
          title: t,
          completed: false
        }));
        setTasks(prev => [...prev, ...newTasks]);
        setNewTaskInput(''); // Clear input on success
      }
    } catch (e) {
      console.error(e);
      // Fallback: just add the input as a single task if AI fails
      addTask(newTaskInput);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8 p-6 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50">
      <h3 className="text-sm uppercase tracking-widest text-slate-400 font-semibold mb-4">Session Tasks</h3>
      
      {/* Input Area */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    if (e.ctrlKey || e.metaKey) {
                        handleGenerateAI();
                    } else {
                        addTask(newTaskInput);
                    }
                }
            }}
            placeholder="Add a task or goal..."
            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
          />
        </div>
        
        <button
          onClick={() => addTask(newTaskInput)}
          disabled={!newTaskInput.trim() || isGenerating}
          className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-xl transition-colors disabled:opacity-50"
          title="Add single task"
        >
          <Plus size={20} />
        </button>

        <button
          onClick={handleGenerateAI}
          disabled={!newTaskInput.trim() || isGenerating}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white p-3 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
          title="AI Breakdown (Gemini)"
        >
          {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {tasks.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm italic">
            No tasks yet. <br/> Try asking AI to "Plan my video script".
          </div>
        )}
        {tasks.map(task => (
          <div 
            key={task.id} 
            className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${task.completed ? 'bg-slate-800/30 opacity-60' : 'bg-slate-800 hover:bg-slate-700/80'}`}
          >
            <button
              onClick={() => toggleTask(task.id)}
              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${task.completed ? 'bg-green-500/20 border-green-500 text-green-500' : 'border-slate-500 text-transparent hover:border-slate-400'}`}
            >
              <Check size={12} strokeWidth={3} />
            </button>
            <span className={`flex-1 text-sm ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
              {task.title}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;