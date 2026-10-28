import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  Search, 
  Trash2, 
  Edit3, 
  CheckSquare
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Task, TaskPriority } from '../types/crm';
import { getPriorityMeta, formatRelativeDate } from '../utils/crmHelpers';

interface TaskScheduleViewProps {
  onOpenNewTask: () => void;
  onEditTask: (task: Task) => void;
}

export const TaskScheduleView: React.FC<TaskScheduleViewProps> = ({
  onOpenNewTask,
  onEditTask,
}) => {
  const { 
    tasks, 
    toggleTask, 
    deleteTask, 
    setSelectedCustomerId, 
    users 
  } = useCRM();

  const [activeFilterTab, setActiveFilterTab] = useState<'pending' | 'today' | 'overdue' | 'completed' | 'all'>('pending');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = '2026-10-12'; // Current base date

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      // Tab filter
      if (activeFilterTab === 'pending' && t.completed) return false;
      if (activeFilterTab === 'completed' && !t.completed) return false;
      if (activeFilterTab === 'today') {
        if (t.completed || t.dueDate !== todayStr) return false;
      }
      if (activeFilterTab === 'overdue') {
        if (t.completed || t.dueDate >= todayStr) return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

      // Owner filter
      if (ownerFilter !== 'all' && t.assignedTo !== ownerFilter) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchCustomer = t.customerName?.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchCustomer) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort: incomplete first, then by date asc
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [tasks, activeFilterTab, priorityFilter, ownerFilter, searchQuery]);

  // Tab count badges
  const pendingCount = tasks.filter(t => !t.completed).length;
  const todayCount = tasks.filter(t => !t.completed && t.dueDate === todayStr).length;
  const overdueCount = tasks.filter(t => !t.completed && t.dueDate < todayStr).length;
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              跟進日程與業務待辦清單
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-mono font-semibold text-slate-700">
              共 {pendingCount} 項待辦
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            規劃拜訪提醒、電話回訪與提案截止日，確保每位客戶皆有密切聯繫。
          </p>
        </div>

        <button
          onClick={onOpenNewTask}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>新增待辦任務</span>
        </button>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 text-xs">
          <button
            onClick={() => setActiveFilterTab('pending')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilterTab === 'pending'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>待處理任務</span>
            <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full ${activeFilterTab === 'pending' ? 'bg-indigo-700' : 'bg-slate-200'}`}>
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => setActiveFilterTab('today')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilterTab === 'today'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>今日到期</span>
            {todayCount > 0 && (
              <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full ${activeFilterTab === 'today' ? 'bg-indigo-700' : 'bg-amber-100 text-amber-800'}`}>
                {todayCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveFilterTab('overdue')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilterTab === 'overdue'
                ? 'bg-rose-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>逾期待辦</span>
            {overdueCount > 0 && (
              <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full ${activeFilterTab === 'overdue' ? 'bg-rose-700' : 'bg-rose-100 text-rose-800 font-bold'}`}>
                {overdueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveFilterTab('completed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilterTab === 'completed'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>已完成歷程</span>
            <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full ${activeFilterTab === 'completed' ? 'bg-indigo-700' : 'bg-slate-200'}`}>
              {completedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeFilterTab === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            全部顯示 ({tasks.length})
          </button>
        </div>

        {/* Secondary filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋任務說明或客戶..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 cursor-pointer focus:outline-none"
          >
            <option value="all">優先度：全部</option>
            <option value="urgent">緊急要件</option>
            <option value="high">高優先級</option>
            <option value="medium">中優先級</option>
            <option value="low">低優先級</option>
          </select>

          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 cursor-pointer focus:outline-none"
          >
            <option value="all">負責人：全部</option>
            {users.map(u => (
              <option key={u.id} value={u.name}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List Items */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">目前沒有符合條件的任務</h3>
          <p className="text-xs text-slate-500">
            太棒了！所有跟進進度皆在掌握中，或可點擊右上角新增排程。
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
          {filteredTasks.map(task => {
            const priorityMeta = getPriorityMeta(task.priority);
            const isOverdue = !task.completed && task.dueDate < todayStr;
            const isToday = !task.completed && task.dueDate === todayStr;

            return (
              <div
                key={task.id}
                className={`p-4 flex items-start sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors ${
                  task.completed ? 'bg-slate-50/50 opacity-60' : ''
                }`}
              >
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 sm:mt-0 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer shrink-0"
                  >
                    <CheckCircle2
                      className={`w-5 h-5 ${
                        task.completed ? 'text-emerald-600 fill-emerald-100' : 'text-slate-300 hover:text-indigo-500'
                      }`}
                    />
                  </button>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityMeta.bgClass} ${priorityMeta.colorClass}`}>
                        {priorityMeta.label}
                      </span>

                      {isOverdue && (
                        <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                          逾期
                        </span>
                      )}

                      {isToday && (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          今日到期
                        </span>
                      )}

                      <span className={`text-sm font-bold text-slate-900 ${task.completed ? 'line-through text-slate-400' : ''}`}>
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      {task.customerName && (
                        <button
                          onClick={() => task.customerId && setSelectedCustomerId(task.customerId)}
                          className="text-indigo-600 hover:underline font-medium text-left truncate max-w-xs cursor-pointer"
                        >
                          客戶: {task.customerName}
                        </button>
                      )}
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {task.dueDate} {task.dueTime || ''}
                      </span>
                      <span>負責人: {task.assignedTo}</span>
                    </div>

                    {task.notes && (
                      <p className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded inline-block">
                        備忘: {task.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEditTask(task)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                    title="編輯"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`確定要刪除「${task.title}」嗎？`)) {
                        deleteTask(task.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                    title="刪除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
