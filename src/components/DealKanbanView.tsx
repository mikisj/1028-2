import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Calendar, 
  Building2, 
  LayoutList, 
  KanbanSquare, 
  ArrowRight,
  Edit3,
  Trash2,
  TrendingUp,
  Percent
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Deal, DealStage } from '../types/crm';
import { formatCurrency, getDealStageMeta } from '../utils/crmHelpers';

interface DealKanbanViewProps {
  onOpenNewDeal: () => void;
  onEditDeal: (deal: Deal) => void;
}

export const DealKanbanView: React.FC<DealKanbanViewProps> = ({
  onOpenNewDeal,
  onEditDeal,
}) => {
  const { 
    deals, 
    updateDealStage, 
    deleteDeal, 
    setSelectedCustomerId, 
    users 
  } = useCRM();

  const [filterQuery, setFilterQuery] = useState('');
  const [filterOwner, setFilterOwner] = useState('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const STAGES: { stage: DealStage; label: string; headerColor: string }[] = [
    { stage: 'lead', label: '1. 潛在商機', headerColor: 'border-slate-400 text-slate-700 bg-slate-50' },
    { stage: 'qualified', label: '2. 需求確認', headerColor: 'border-blue-500 text-blue-700 bg-blue-50/50' },
    { stage: 'proposal', label: '3. 方案報價', headerColor: 'border-indigo-500 text-indigo-700 bg-indigo-50/50' },
    { stage: 'negotiating', label: '4. 商務談判', headerColor: 'border-amber-500 text-amber-700 bg-amber-50/50' },
    { stage: 'won', label: '5. 贏單成交', headerColor: 'border-emerald-500 text-emerald-700 bg-emerald-50/50' },
    { stage: 'lost', label: '6. 輸單結案', headerColor: 'border-rose-400 text-rose-700 bg-rose-50/50' },
  ];

  const filteredDeals = useMemo(() => {
    return deals.filter(d => {
      if (filterQuery.trim()) {
        const q = filterQuery.toLowerCase().trim();
        const matchTitle = d.title.toLowerCase().includes(q);
        const matchCustomer = d.customerName.toLowerCase().includes(q);
        if (!matchTitle && !matchCustomer) return false;
      }
      if (filterOwner !== 'all' && d.assignedTo !== filterOwner) return false;
      return true;
    });
  }, [deals, filterQuery, filterOwner]);

  // Overall totals
  const totalValue = filteredDeals.reduce((sum, d) => sum + d.amount, 0);
  const weightedForecast = filteredDeals
    .filter(d => d.stage !== 'lost')
    .reduce((sum, d) => sum + (d.amount * d.probability) / 100, 0);

  // Stage transition helpers
  const stageOrder: DealStage[] = ['lead', 'qualified', 'proposal', 'negotiating', 'won', 'lost'];
  
  const moveNext = (deal: Deal) => {
    const currentIndex = stageOrder.indexOf(deal.stage);
    if (currentIndex >= 0 && currentIndex < 4) { // Up to won
      updateDealStage(deal.id, stageOrder[currentIndex + 1]);
    }
  };

  const movePrev = (deal: Deal) => {
    const currentIndex = stageOrder.indexOf(deal.stage);
    if (currentIndex > 0 && currentIndex <= 4) {
      updateDealStage(deal.id, stageOrder[currentIndex - 1]);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Title & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              銷售商機管道與漏斗看板
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-mono font-semibold text-slate-700">
              共 {deals.length} 個商機案
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            以階段漏斗推進商機進程，預估成交機率與加權收益。
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
            <button
              onClick={() => setViewMode('kanban')}
              title="看板模式"
              className={`p-1.5 transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <KanbanSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="清單模式"
              className={`p-1.5 transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenNewDeal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>建立新商機</span>
          </button>
        </div>
      </div>

      {/* Filter and Value Metric Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="搜尋商機名稱或客戶..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
            />
          </div>

          <select
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 cursor-pointer focus:outline-none"
          >
            <option value="all">負責業務：全部</option>
            {users.map(u => (
              <option key={u.id} value={u.name}>{u.name}</option>
            ))}
          </select>
        </div>

        {/* Pipeline Value Stats */}
        <div className="flex items-center gap-4 text-xs font-mono ml-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">商機總額:</span>
            <span className="font-bold text-slate-900">{formatCurrency(totalValue)}</span>
          </div>
          <div className="text-slate-300">|</div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">加權預估值:</span>
            <span className="font-bold text-indigo-700">{formatCurrency(weightedForecast)}</span>
          </div>
        </div>
      </div>

      {/* Content: Kanban View or List View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start">
          {STAGES.map(col => {
            const colDeals = filteredDeals.filter(d => d.stage === col.stage);
            const colTotal = colDeals.reduce((sum, d) => sum + d.amount, 0);

            return (
              <div 
                key={col.stage}
                className="bg-slate-100/70 rounded-xl p-2.5 border border-slate-200 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className={`p-2.5 rounded-lg border-b-2 mb-2 ${col.headerColor}`}>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{col.label}</span>
                    <span className="font-mono text-[11px] px-1.5 py-0.2 bg-white/80 rounded">
                      {colDeals.length}
                    </span>
                  </div>
                  <div className="text-xs font-mono font-bold mt-1 text-slate-800">
                    {formatCurrency(colTotal)}
                  </div>
                </div>

                {/* Deal Cards Container */}
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {colDeals.length === 0 ? (
                    <div className="text-center py-8 text-[11px] text-slate-400">
                      無商機案件
                    </div>
                  ) : (
                    colDeals.map(deal => (
                      <div
                        key={deal.id}
                        className="bg-white p-3 rounded-lg border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow space-y-2 group"
                      >
                        {/* Customer link */}
                        <div className="flex items-start justify-between gap-1">
                          <button
                            onClick={() => setSelectedCustomerId(deal.customerId)}
                            className="text-[11px] font-semibold text-indigo-600 hover:underline truncate text-left max-w-[130px] block cursor-pointer"
                          >
                            {deal.customerName}
                          </button>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEditDeal(deal)}
                              className="p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                              title="編輯"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`確定要刪除「${deal.title}」嗎？`)) {
                                  deleteDeal(deal.id);
                                }
                              }}
                              className="p-0.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                              title="刪除"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Deal Title */}
                        <div className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                          {deal.title}
                        </div>

                        {/* Amount */}
                        <div className="text-sm font-bold font-mono text-slate-900">
                          {formatCurrency(deal.amount)}
                        </div>

                        {/* Probability Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                            <span>預估勝率</span>
                            <span className="font-mono font-bold text-slate-700">{deal.probability}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                deal.probability >= 70 ? 'bg-emerald-500' : deal.probability >= 40 ? 'bg-amber-500' : 'bg-slate-400'
                              }`}
                              style={{ width: `${deal.probability}%` }}
                            />
                          </div>
                        </div>

                        {/* Metadata: Owner & Date */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                          <span>{deal.assignedTo}</span>
                          <span className="font-mono">{deal.expectedCloseDate}</span>
                        </div>

                        {/* Stage Action Controls */}
                        <div className="flex items-center justify-between pt-1 gap-1 text-[11px]">
                          {deal.stage !== 'lead' && deal.stage !== 'lost' && (
                            <button
                              onClick={() => movePrev(deal)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                              title="退回上一階段"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {deal.stage !== 'won' && deal.stage !== 'lost' && (
                            <div className="flex items-center gap-1 ml-auto">
                              <button
                                onClick={() => updateDealStage(deal.id, 'won')}
                                className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-semibold cursor-pointer"
                                title="標記贏單成交"
                              >
                                成交
                              </button>
                              <button
                                onClick={() => updateDealStage(deal.id, 'lost')}
                                className="px-1.5 py-0.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[10px] font-semibold cursor-pointer"
                                title="標記輸單"
                              >
                                輸單
                              </button>
                              <button
                                onClick={() => moveNext(deal)}
                                className="p-1 hover:bg-slate-100 rounded text-indigo-600 transition-colors cursor-pointer"
                                title="推進下一階段"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode View */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-3.5">商機案名</th>
                <th className="py-3 px-3.5">關聯客戶</th>
                <th className="py-3 px-3.5">商機金額</th>
                <th className="py-3 px-3.5">當前階段</th>
                <th className="py-3 px-3.5">預估勝率</th>
                <th className="py-3 px-3.5">預計結案日</th>
                <th className="py-3 px-3.5">負責業務</th>
                <th className="py-3 px-3.5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDeals.map(deal => {
                const stageMeta = getDealStageMeta(deal.stage);
                return (
                  <tr key={deal.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3.5 font-bold text-slate-900">
                      {deal.title}
                    </td>
                    <td className="py-3.5 px-3.5">
                      <button
                        onClick={() => setSelectedCustomerId(deal.customerId)}
                        className="text-indigo-600 hover:underline font-medium cursor-pointer"
                      >
                        {deal.customerName}
                      </button>
                    </td>
                    <td className="py-3.5 px-3.5 font-mono font-bold text-slate-900">
                      {formatCurrency(deal.amount)}
                    </td>
                    <td className="py-3.5 px-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${stageMeta.bgClass} ${stageMeta.colorClass}`}>
                        {stageMeta.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-3.5 font-mono">
                      {deal.probability}%
                    </td>
                    <td className="py-3.5 px-3.5 font-mono text-slate-500">
                      {deal.expectedCloseDate}
                    </td>
                    <td className="py-3.5 px-3.5 font-medium">
                      {deal.assignedTo}
                    </td>
                    <td className="py-3.5 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditDeal(deal)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`確定要刪除「${deal.title}」嗎？`)) {
                              deleteDeal(deal.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
