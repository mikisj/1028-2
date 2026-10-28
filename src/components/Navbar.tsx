import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  Bell, 
  User, 
  Briefcase, 
  CalendarCheck,
  ChevronDown
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';

interface NavbarProps {
  onOpenNewCustomer: () => void;
  onOpenNewDeal: () => void;
  onOpenNewTask: () => void;
  onOpenDataModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewCustomer,
  onOpenNewDeal,
  onOpenNewTask,
  onOpenDataModal,
}) => {
  const {
    currentUser,
    setCurrentUser,
    users,
    searchQuery,
    setSearchQuery,
    tasks,
    setActiveTab,
    exportCustomersCSV,
  } = useCRM();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Pending urgent tasks count
  const pendingUrgentTasks = tasks.filter(t => !t.completed && (t.priority === 'urgent' || t.priority === 'high')).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Brand & Left Info */}
      <div className="flex items-center gap-3 min-w-[200px]">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm font-semibold tracking-wider">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
              雲客通 CRM
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono font-medium">
              v2.6
            </span>
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            全方位客戶關係與銷售管道管理
          </p>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-xl mx-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋客戶公司名、統編、聯絡人、電話或關鍵字..."
            className="w-full pl-9 pr-12 py-2 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-800 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              清除
            </button>
          )}
        </div>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">快速新增</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {showQuickAdd && (
            <div 
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 text-sm animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setShowQuickAdd(false)}
            >
              <button
                onClick={() => {
                  setShowQuickAdd(false);
                  onOpenNewCustomer();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 text-left cursor-pointer"
              >
                <User className="w-4 h-4 text-indigo-600" />
                <span>新增客戶檔案</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickAdd(false);
                  onOpenNewDeal();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 text-left cursor-pointer"
              >
                <Briefcase className="w-4 h-4 text-amber-600" />
                <span>新增銷售商機</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickAdd(false);
                  onOpenNewTask();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 text-left cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                <span>新增跟進待辦</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Export / Backup Button */}
        <button
          onClick={onOpenDataModal}
          title="資料備份與匯出入"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Urgent Task Notification Indicator */}
        <button
          onClick={() => setActiveTab('tasks')}
          title={`有 ${pendingUrgentTasks} 項優先跟進要件`}
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          {pendingUrgentTasks > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
              {pendingUrgentTasks}
            </span>
          )}
        </button>

        {/* Active User Switcher */}
        <div className="relative border-l border-slate-200 pl-2 sm:pl-3">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-left"
          >
            <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold">
              {currentUser.avatar}
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-slate-500 leading-tight">
                {currentUser.title}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div 
              className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] text-slate-400 font-medium">
                切換負責人檢視角度
              </div>
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setCurrentUser(u);
                    setShowUserMenu(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                    currentUser.id === u.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                    {u.avatar}
                  </div>
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-[10px] text-slate-400">{u.title}</div>
                  </div>
                  {currentUser.id === u.id && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
