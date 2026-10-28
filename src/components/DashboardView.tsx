import React from 'react';
import { 
  Users, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Phone, 
  Calendar, 
  ArrowUpRight, 
  AlertCircle,
  Building,
  Plus,
  MessageSquare,
  FileText
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { formatCurrency, getTierMeta, getActivityTypeMeta, getActivityOutcomeMeta } from '../utils/crmHelpers';
import { DealStage } from '../types/crm';

interface DashboardViewProps {
  onOpenNewCustomer: () => void;
  onOpenNewDeal: () => void;
  onOpenNewTask: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewCustomer,
  onOpenNewDeal,
  onOpenNewTask,
}) => {
  const { 
    customers, 
    deals, 
    tasks, 
    activities, 
    setSelectedCustomerId, 
    setActiveTab,
    toggleTask
  } = useCRM();

  // Metrics
  const totalCustomers = customers.length;
  const vipCustomersCount = customers.filter(c => c.tier === 'VIP').length;
  const activeDeals = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost');
  const pipelineValue = activeDeals.reduce((sum, d) => sum + d.amount, 0);
  
  const wonDeals = deals.filter(d => d.stage === 'won');
  const wonValue = wonDeals.reduce((sum, d) => sum + d.amount, 0);

  const pendingTasks = tasks.filter(t => !t.completed);
  const urgentTasks = pendingTasks.filter(t => t.priority === 'urgent' || t.priority === 'high');

  // Pipeline funnel stats
  const stages: { stage: DealStage; label: string; color: string }[] = [
    { stage: 'lead', label: '潛在商機', color: 'bg-slate-400' },
    { stage: 'qualified', label: '需求確認', color: 'bg-blue-500' },
    { stage: 'proposal', label: '方案報價', color: 'bg-indigo-500' },
    { stage: 'negotiating', label: '商務談判', color: 'bg-amber-500' },
    { stage: 'won', label: '贏單成交', color: 'bg-emerald-500' },
  ];

  const stageCounts = stages.map(s => {
    const list = deals.filter(d => d.stage === s.stage);
    const sum = list.reduce((acc, d) => acc + d.amount, 0);
    return { ...s, count: list.length, sum };
  });

  // Recent 5 activities
  const recentActivities = [...activities].slice(0, 5);

  // Top 4 Valuable Clients
  const topCustomers = [...customers]
    .sort((a, b) => (b.annualBudget || 0) - (a.annualBudget || 0))
    .slice(0, 4);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            業績總覽與跟進儀表板
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            即時掌握客戶關係發展動態、在洽商機額度與即時待辦事項。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewCustomer}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600" />
            新增客戶
          </button>
          <button
            onClick={onOpenNewDeal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            建立商機
          </button>
        </div>
      </div>

      {/* KPI 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Customers */}
        <div 
          onClick={() => setActiveTab('customers')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">客戶名單總數</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {totalCustomers}
            </span>
            <span className="text-xs text-slate-500">戶</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 border-t border-slate-100 pt-2">
            <span>VIP 核心客群</span>
            <span className="font-semibold text-purple-700 font-mono">{vipCustomersCount} 戶</span>
            <span className="text-slate-300">·</span>
            <span className="text-indigo-600 group-hover:underline">檢視名冊 →</span>
          </div>
        </div>

        {/* Card 2: Active Pipeline Value */}
        <div 
          onClick={() => setActiveTab('deals')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">進行中商機總額</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {formatCurrency(pipelineValue)}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 border-t border-slate-100 pt-2">
            <span>在洽中商機</span>
            <span className="font-semibold text-amber-700 font-mono">{activeDeals.length} 筆</span>
            <span className="text-slate-300">·</span>
            <span className="text-indigo-600 group-hover:underline">商機看板 →</span>
          </div>
        </div>

        {/* Card 3: Won Deals Value */}
        <div 
          onClick={() => setActiveTab('deals')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">已贏單成交總額</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {formatCurrency(wonValue)}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 border-t border-slate-100 pt-2">
            <span>成交專案</span>
            <span className="font-semibold text-emerald-700 font-mono">{wonDeals.length} 件</span>
            <span className="text-slate-300">·</span>
            <span className="text-emerald-600 font-medium">達成合約生效</span>
          </div>
        </div>

        {/* Card 4: Pending Tasks */}
        <div 
          onClick={() => setActiveTab('tasks')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">待跟進待辦日程</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {pendingTasks.length}
            </span>
            <span className="text-xs text-slate-500">項未結</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 border-t border-slate-100 pt-2">
            <span>緊急/高度優先</span>
            <span className="font-semibold text-rose-600 font-mono">{urgentTasks.length} 項</span>
            <span className="text-slate-300">·</span>
            <span className="text-indigo-600 group-hover:underline">前往排程 →</span>
          </div>
        </div>
      </div>

      {/* Sales Pipeline Stage Distribution Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              銷售管道漏斗進度 (Pipeline Funnel)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              各階段商機案件數與預估金額比例
            </p>
          </div>
          <button
            onClick={() => setActiveTab('deals')}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            開啟看板視圖 <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          {stageCounts.map(st => (
            <div key={st.stage} className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">{st.label}</span>
                <span className="font-mono text-slate-500">{st.count} 件</span>
              </div>
              <div className="text-sm font-bold font-mono text-slate-900">
                {formatCurrency(st.sum)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Columns Grid: Pending Urgent Tasks & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Pending Follow-up Tasks */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  即刻待跟進要件
                </h3>
              </div>
              <button
                onClick={onOpenNewTask}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                + 新增待辦
              </button>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                目前沒有待辦事項，所有跟進皆已按時完成！
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-white flex items-start gap-3 transition-colors"
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        {task.priority === 'urgent' && (
                          <span className="text-rose-600 font-semibold text-[11px]">【緊急】</span>
                        )}
                        {task.priority === 'high' && (
                          <span className="text-amber-600 font-semibold text-[11px]">【優先】</span>
                        )}
                        <span className="font-medium text-slate-800 truncate">
                          {task.title}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                        {task.customerName && (
                          <button
                            onClick={() => task.customerId && setSelectedCustomerId(task.customerId)}
                            className="text-indigo-600 hover:underline truncate max-w-[180px] text-left"
                          >
                            {task.customerName}
                          </button>
                        )}
                        <span>截止: {task.dueDate}</span>
                        <span>負責: {task.assignedTo}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>共 {pendingTasks.length} 項待辦事項</span>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-indigo-600 hover:underline font-medium"
            >
              檢視完整待辦日程 →
            </button>
          </div>
        </div>

        {/* Right: Recent Activity Log */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  最新客戶互動動態
                </h3>
              </div>
              <span className="text-xs text-slate-400">最近 5 筆紀錄</span>
            </div>

            <div className="space-y-3">
              {recentActivities.map((act) => {
                const typeMeta = getActivityTypeMeta(act.type);
                const outcomeMeta = getActivityOutcomeMeta(act.outcome);
                return (
                  <div
                    key={act.id}
                    onClick={() => setSelectedCustomerId(act.customerId)}
                    className="p-3 rounded-lg border border-slate-100 hover:border-slate-300 bg-slate-50/50 hover:bg-white transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {act.customerName || '客戶'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {act.createdAt}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                      <span className={`font-medium ${typeMeta.colorClass}`}>
                        [{typeMeta.label}]
                      </span>
                      <span className="truncate">{act.title}</span>
                      <span className={`text-[11px] ml-auto ${outcomeMeta.colorClass}`}>
                        {outcomeMeta.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-1">
                      {act.content}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>隨時紀錄電話、面談與提案</span>
            <button
              onClick={() => setActiveTab('customers')}
              className="text-indigo-600 hover:underline font-medium"
            >
              前往客戶檔案紀錄互動 →
            </button>
          </div>
        </div>
      </div>

      {/* Top Valuable Customers Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">
              重點核心客戶快速捷徑
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('customers')}
            className="text-xs text-indigo-600 hover:underline font-medium"
          >
            檢視全部名單 ({totalCustomers}) →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {topCustomers.map(cust => {
            const tierMeta = getTierMeta(cust.tier);
            return (
              <div
                key={cust.id}
                onClick={() => setSelectedCustomerId(cust.id)}
                className="p-3.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-xs bg-white transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className={`text-[11px] font-semibold ${tierMeta.colorClass}`}>
                    {tierMeta.label}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {cust.industry}
                  </span>
                </div>
                <div className="font-semibold text-slate-800 text-sm truncate group-hover:text-indigo-600 transition-colors">
                  {cust.companyName}
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                  <span>聯絡人: {cust.contactPerson}</span>
                  <span className="font-mono text-slate-700 font-semibold">
                    預算 {formatCurrency(cust.annualBudget || 0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
