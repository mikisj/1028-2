import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  KanbanSquare, 
  CheckSquare, 
  BarChart3, 
  TrendingUp,
  Sparkles,
  PhoneCall,
  ShieldCheck
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { ActiveNavTab } from '../types/crm';
import { formatCurrency } from '../utils/crmHelpers';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    customers, 
    deals, 
    tasks,
    currentUser
  } = useCRM();

  // Stats for badges
  const totalCustomers = customers.length;
  const activeDeals = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost');
  const pipelineValue = activeDeals.reduce((sum, d) => sum + d.amount, 0);
  const pendingTasks = tasks.filter(t => !t.completed).length;

  const navItems: { id: ActiveNavTab; label: string; icon: React.ElementType; badge?: string | number }[] = [
    {
      id: 'dashboard',
      label: '總覽儀表板',
      icon: LayoutDashboard,
    },
    {
      id: 'customers',
      label: '客戶名錄 (360°)',
      icon: Users,
      badge: totalCustomers,
    },
    {
      id: 'deals',
      label: '銷售商機 (管道)',
      icon: KanbanSquare,
      badge: activeDeals.length,
    },
    {
      id: 'tasks',
      label: '跟進待辦日程',
      icon: CheckSquare,
      badge: pendingTasks > 0 ? pendingTasks : undefined,
    },
    {
      id: 'analytics',
      label: '業績與統計報表',
      icon: BarChart3,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0 select-none">
      {/* Top Nav links */}
      <div className="p-4 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            業務管理核心
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${
                        isActive
                          ? 'bg-indigo-700/60 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Pipeline Status Box */}
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              在洽商機額
            </span>
            <span className="font-mono text-slate-200">{activeDeals.length} 案</span>
          </div>
          <div className="text-lg font-bold text-white tracking-tight font-mono">
            {formatCurrency(pipelineValue)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-700/60 pt-2">
            <span>待辦跟進清單</span>
            <span className={`font-mono font-semibold ${pendingTasks > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              {pendingTasks} 項未完成
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Profile & System Badge */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-xs font-bold">
            {currentUser.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-200 truncate">
              {currentUser.name}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {currentUser.email}
            </div>
          </div>
        </div>

        <div className="px-2 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            資料即時本地加密儲存
          </span>
          <span className="text-emerald-400 font-mono text-[10px]">連線就緒</span>
        </div>
      </div>
    </aside>
  );
};
