import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Plus, Trash2, Loader2 } from 'lucide-react';

const DailyPlanner = () => {
  const { user, reloadUserProfile } = useContext(AuthContext);
  const { showToast, triggerReload } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskType, setNewTaskType] = useState('custom');
  
  // Mobile active tab: 'Pending', 'In Progress', 'Completed', 'Skipped'
  const [activeMobileTab, setActiveMobileTab] = useState('Pending');

  const fetchPlannerTasks = async () => {
    try {
      const res = await api.get('/planner');
      setTasks(res.data);
    } catch (err) {
      showToast('Error loading daily tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannerTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    try {
      const res = await api.post('/planner', {
        name: newTaskName,
        type: newTaskType,
      });
      setTasks([...tasks, res.data]);
      setNewTaskName('');
      setNewTaskType('custom');
      showToast('Custom task added!', 'success');
      triggerReload();
    } catch (err) {
      showToast('Failed to add task', 'error');
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/planner/${taskId}`, { status: newStatus });
      setTasks(prev =>
        prev.map(t => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
      
      if (res.data.xpGained > 0) {
        if (res.data.dailyCompletedReward) {
          showToast('Daily Goal Achieved! +50 XP bonus awarded! 🌟', 'success');
        } else {
          showToast(`Task marked as ${newStatus}! +${res.data.xpGained} XP awarded.`, 'success');
        }
      } else if (res.data.xpGained < 0) {
        showToast(`Task unmarked. XP adjusted.`, 'info');
      } else {
        showToast(`Task status set to ${newStatus}`, 'success');
      }
      reloadUserProfile();
      triggerReload();
    } catch (err) {
      showToast('Failed to update task status', 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/planner/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
      showToast('Task removed from planner', 'success');
      triggerReload();
    } catch (err) {
      showToast('Failed to delete task', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-10 h-10 text-[#2563EB] animate-spin" />
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => t.status === 'Pending');
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const skippedTasks = tasks.filter(t => t.status === 'Skipped');

  // Helper renderer for a single task card
  const renderTaskCard = (task, isDraggableStyle = false) => {
    const isCompleted = task.status === 'Completed';
    const isSkipped = task.status === 'Skipped';
    const isInProgress = task.status === 'In Progress';

    return (
      <div 
        key={task._id} 
        className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all space-y-3 relative group ${
          isInProgress ? 'border-l-2 border-l-[#2563EB] border-y border-r border-[#E5E7EB]' : 'border-[#E5E7EB]'
        }`}
      >
        <div className="flex justify-between items-start">
          <h4 className={`text-xs font-semibold text-[#111827] leading-normal pr-4 ${isCompleted ? 'line-through text-gray-400' : ''}`}>
            {task.name}
          </h4>
          <button 
            onClick={() => handleDeleteTask(task._id)} 
            className="text-gray-400 hover:text-[#EF4444] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="flex items-center justify-between border-t border-gray-50 pt-2 text-[10px]">
          <span className={`font-bold uppercase ${
            task.type === 'learn' ? 'text-[#2563EB]' :
            task.type === 'revise' ? 'text-purple-600' :
            task.type === 'interview' ? 'text-[#22C55E]' : 'text-[#6B7280]'
          }`}>
            {task.type}
          </span>
          
          <div className="flex space-x-1">
            {task.status === 'Pending' && (
              <>
                <button
                  onClick={() => handleUpdateStatus(task._id, 'In Progress')}
                  className="px-2 py-0.5 border border-[#E5E7EB] rounded hover:border-[#2563EB] hover:text-[#2563EB] transition-colors text-[#6B7280] font-semibold cursor-pointer"
                >
                  Start
                </button>
                <button
                  onClick={() => handleUpdateStatus(task._id, 'Skipped')}
                  className="px-2 py-0.5 border border-[#E5E7EB] rounded hover:border-red-200 hover:text-[#EF4444] transition-colors text-[#6B7280] font-semibold cursor-pointer"
                >
                  Skip
                </button>
                <button
                  onClick={() => handleUpdateStatus(task._id, 'Completed')}
                  className="px-2 py-0.5 bg-green-50 hover:bg-green-100 border border-green-200 text-[#22C55E] rounded transition-colors font-bold cursor-pointer"
                >
                  Done
                </button>
              </>
            )}

            {task.status === 'In Progress' && (
              <>
                <button
                  onClick={() => handleUpdateStatus(task._id, 'Skipped')}
                  className="px-2 py-0.5 border border-[#E5E7EB] rounded hover:border-red-200 hover:text-[#EF4444] transition-colors text-[#6B7280] font-semibold cursor-pointer"
                >
                  Skip
                </button>
                <button
                  onClick={() => handleUpdateStatus(task._id, 'Completed')}
                  className="px-2 py-0.5 bg-green-50 hover:bg-green-100 border border-green-200 text-[#22C55E] rounded transition-colors font-bold cursor-pointer"
                >
                  Done
                </button>
              </>
            )}

            {(task.status === 'Completed' || task.status === 'Skipped') && (
              <button
                onClick={() => handleUpdateStatus(task._id, 'Pending')}
                className="px-2 py-0.5 border border-[#E5E7EB] rounded hover:border-gray-300 text-gray-400 hover:text-[#111827] transition-colors font-semibold cursor-pointer"
              >
                Restore
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Planner Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-50 p-2 border border-blue-100 rounded-lg text-[#2563EB]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111827]">Daily Study Planner</h2>
            <p className="text-xs text-[#6B7280]">
              Task board for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="text-xs font-semibold text-[#6B7280] bg-gray-50 border border-[#E5E7EB] px-3 py-1 rounded-full shrink-0">
          🎯 Progress: {completedTasks.length} / {tasks.length} Done
        </div>
      </div>

      {/* Task input form */}
      <form onSubmit={handleAddTask} className="bg-white border border-[#E5E7EB] rounded-xl p-3 shadow-sm flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          required
          placeholder="What do you want to achieve today?..."
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#2563EB] text-xs text-[#111827]"
        />

        <div className="flex gap-2 shrink-0">
          <select
            value={newTaskType}
            onChange={(e) => setNewTaskType(e.target.value)}
            className="px-3 py-1.5 border border-[#E5E7EB] rounded-lg bg-white text-xs font-semibold text-[#6B7280] outline-none cursor-pointer"
          >
            <option value="custom">Custom Task</option>
            <option value="learn">Learn Topic</option>
            <option value="revise">Revise Concept</option>
            <option value="interview">Practice Q&A</option>
          </select>

          <button
            type="submit"
            className="px-4 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Add Task
          </button>
        </div>
      </form>

      {/* MOBILE MOBILE VIEWS (Tabbed Navigation) */}
      <div className="block md:hidden space-y-4">
        {/* Mobile columns tabs */}
        <div className="flex space-x-1 bg-white border border-[#E5E7EB] rounded-xl p-1 shadow-sm">
          {[
            { id: 'Pending', count: pendingTasks.length },
            { id: 'In Progress', count: inProgressTasks.length },
            { id: 'Completed', count: completedTasks.length },
            { id: 'Skipped', count: skippedTasks.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveMobileTab(tab.id)}
              className={`flex-1 py-2 text-center rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                activeMobileTab === tab.id
                  ? 'bg-blue-50/50 text-[#2563EB] shadow-inner'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <span>{tab.id}</span>
              <span className="ml-1 bg-gray-100 text-gray-500 px-1 py-0.5 rounded text-[8px]">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Selected Mobile Column */}
        <div className="space-y-2">
          {activeMobileTab === 'Pending' && (
            <div className="space-y-2">
              {pendingTasks.length === 0 ? (
                <p className="text-center text-xs text-[#6B7280] py-6">No pending tasks</p>
              ) : (
                pendingTasks.map(t => renderTaskCard(t))
              )}
            </div>
          )}
          {activeMobileTab === 'In Progress' && (
            <div className="space-y-2">
              {inProgressTasks.length === 0 ? (
                <p className="text-center text-xs text-[#6B7280] py-6">No tasks in progress</p>
              ) : (
                inProgressTasks.map(t => renderTaskCard(t))
              )}
            </div>
          )}
          {activeMobileTab === 'Completed' && (
            <div className="space-y-2">
              {completedTasks.length === 0 ? (
                <p className="text-center text-xs text-[#6B7280] py-6">No completed tasks</p>
              ) : (
                completedTasks.map(t => renderTaskCard(t))
              )}
            </div>
          )}
          {activeMobileTab === 'Skipped' && (
            <div className="space-y-2">
              {skippedTasks.length === 0 ? (
                <p className="text-center text-xs text-[#6B7280] py-6">No skipped tasks</p>
              ) : (
                skippedTasks.map(t => renderTaskCard(t))
              )}
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP DESKTOP VIEWS (4 Column Grid layout) */}
      <div className="hidden md:grid md:grid-cols-4 gap-6 items-start">
        
        {/* PENDING COLUMN */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-[10px] text-[#6B7280] uppercase tracking-widest">
              Pending
            </h3>
            <span className="bg-gray-100 text-gray-500 font-bold px-1.5 py-0.5 rounded text-[9px]">{pendingTasks.length}</span>
          </div>
          <div className="space-y-2.5">
            {pendingTasks.map((t) => renderTaskCard(t))}
          </div>
        </div>

        {/* IN PROGRESS COLUMN */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-[10px] text-[#2563EB] uppercase tracking-widest">
              In Progress
            </h3>
            <span className="bg-blue-50 text-[#2563EB] font-bold px-1.5 py-0.5 rounded text-[9px]">{inProgressTasks.length}</span>
          </div>
          <div className="space-y-2.5">
            {inProgressTasks.map((t) => renderTaskCard(t))}
          </div>
        </div>

        {/* COMPLETED COLUMN */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-[10px] text-[#22C55E] uppercase tracking-widest">
              Completed
            </h3>
            <span className="bg-green-50 text-[#22C55E] font-bold px-1.5 py-0.5 rounded text-[9px]">{completedTasks.length}</span>
          </div>
          <div className="space-y-2.5">
            {completedTasks.map((t) => renderTaskCard(t))}
          </div>
        </div>

        {/* SKIPPED COLUMN */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-[10px] text-[#EF4444] uppercase tracking-widest">
              Skipped
            </h3>
            <span className="bg-red-50 text-[#EF4444] font-bold px-1.5 py-0.5 rounded text-[9px]">{skippedTasks.length}</span>
          </div>
          <div className="space-y-2.5">
            {skippedTasks.map((t) => renderTaskCard(t))}
          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DailyPlanner;
