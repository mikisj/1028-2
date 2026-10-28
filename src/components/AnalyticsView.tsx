import React, { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Users, 
  Briefcase, 
  Award, 
  Target, 
  DollarSign 
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { formatCurrency, formatNumber, getTierMeta, getDealStageMeta } from '../utils/crmHelpers';

export const AnalyticsView: React.FC = () => {
  const { customers, deals, users } = useCRM();

  // Total metrics
  const totalPipeline = deals
    .filter(d => d.stage !== 'won' && d.stage !== 'lost')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalWon = deals
    .filter(d => d.stage === 'won')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalBudget = customers.reduce((sum, c) => sum + (c.annualBudget || 0), 0);

  // By Tier
  const tierStats = useMemo(() => {
    const tiers: ('VIP' | 'A' | 'B' | 'C')[] = ['VIP', 'A', 'B', 'C'];
    return tiers.map(tier => {
      const list = customers.filter(c => c.tier === tier);
      const budgetSum = list.reduce((sum, c) => sum + (c.annualBudget || 0), 0);
      return {
        tier,
        count: list.length,
        budgetSum,
        percent: customers.length ? Math.round((list.length / customers.length) * 100) : 0,
      };
    });
  }, [customers]);

  // By Industry
  const industryStats = useMemo(() => {
    const map = new Map<string, { count: number; budgetSum: number }>();
    customers.forEach(c => {
      const ind = c.industry || '其他';
      const existing = map.get(ind) || { count: 0, budgetSum: 0 };
      map.set(ind, {
        count: existing.count + 1,
        budgetSum: existing.budgetSum + (c.annualBudget || 0),
      });
    });

    return Array.from(map.entries())
      .map(([industry, data]) => ({ industry, ...data }))
      .sort((a, b) => b.budgetSum - a.budgetSum);
  }, [customers]);

  // By Customer Source
  const sourceStats = useMemo(() => {
    const map = new Map<string, number>();
    customers.forEach(c => {
      const src = c.source || '其他';
      map.set(src, (map.get(src) || 0) + 1);
    });

    return Array.from(map.entries())
      .map(([source, count]) => ({
        source,
        count,
        percent: customers.length ? Math.round((count / customers.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [customers]);

  // Sales Rep Performance
  const salesRepStats = useMemo(() => {
    return users.map(user => {
      const userCustomers = customers.filter(c => c.assignedTo === user.name);
      const userDeals = deals.filter(d => d.assignedTo === user.name);
      const activeDeals = userDeals.filter(d => d.stage !== 'won' && d.stage !== 'lost');
      const wonDeals = userDeals.filter(d => d.stage === 'won');

      const activeValue = activeDeals.reduce((sum, d) => sum + d.amount, 0);
      const wonValue = wonDeals.reduce((sum, d) => sum + d.amount, 0);

      return {
        user,
        customerCount: userCustomers.length,
        activeDealsCount: activeDeals.length,
        activeValue,
        wonValue,
        wonCount: wonDeals.length,
      };
    }).sort((a, b) => (b.wonValue + b.activeValue) - (a.wonValue + a.activeValue));
  }, [users, customers, deals]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          業績統計與商機多維度分析
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          深度剖析客戶金字塔分佈、產業佔比、客源轉換率與業務戰力排行。
        </p>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>累積贏單成交額</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            {formatCurrency(totalWon)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            已成功落袋簽約專案收入
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>在洽中商機價值</span>
            <Briefcase className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-700">
            {formatCurrency(totalPipeline)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            進行中管道潛在可轉化收益
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>全客戶年度預算池</span>
            <Target className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {formatCurrency(totalBudget)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            涵蓋全部在冊 {customers.length} 戶客戶之評估預算
          </div>
        </div>
      </div>

      {/* Two columns: Customer Tier Pyramid & Lead Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Tier Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              客戶價值金字塔等級分佈
            </h3>
            <span className="text-xs text-slate-400">依年度預算與規模</span>
          </div>

          <div className="space-y-3 pt-2">
            {tierStats.map(item => {
              const meta = getTierMeta(item.tier);
              return (
                <div key={item.tier} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${meta.colorClass}`}>
                        {meta.label}
                      </span>
                      <span className="text-slate-400">({item.count} 戶 · {item.percent}%)</span>
                    </div>
                    <span className="font-mono font-bold text-slate-800">
                      預算 {formatCurrency(item.budgetSum)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        item.tier === 'VIP' ? 'bg-purple-600' : item.tier === 'A' ? 'bg-blue-600' : item.tier === 'B' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                      style={{ width: `${Math.max(item.percent, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lead Sources Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              客戶來源管道效益分佈
            </h3>
            <span className="text-xs text-slate-400">獲客來源佔比</span>
          </div>

          <div className="space-y-3 pt-2">
            {sourceStats.map(item => (
              <div key={item.source} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800">{item.source}</span>
                  <span className="font-mono text-slate-600">
                    {item.count} 戶 ({item.percent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500"
                    style={{ width: `${Math.max(item.percent, 3)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Industry Breakdown Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-slate-800">
          產業領域分佈與預估產值
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">產業領域</th>
                <th className="py-2.5 px-3">客戶數量</th>
                <th className="py-2.5 px-3">佔比</th>
                <th className="py-2.5 px-3">年度預算總額</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {industryStats.map(ind => (
                <tr key={ind.industry} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-medium text-slate-900">{ind.industry}</td>
                  <td className="py-2.5 px-3 font-mono">{ind.count} 戶</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">
                    {customers.length ? Math.round((ind.count / customers.length) * 100) : 0}%
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {formatCurrency(ind.budgetSum)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Rep Performance Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            業務同仁業績與商機戰力榜
          </h3>
          <span className="text-xs text-slate-400">依總成交與管道金額排序</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">業務人員</th>
                <th className="py-2.5 px-3">負責客戶數</th>
                <th className="py-2.5 px-3">洽談中商機</th>
                <th className="py-2.5 px-3">洽談商機額</th>
                <th className="py-2.5 px-3">已贏單成交數</th>
                <th className="py-2.5 px-3 text-right">已成交總額</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {salesRepStats.map((rep, idx) => (
                <tr key={rep.user.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
                        {rep.user.avatar}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">{rep.user.name}</span>
                        <span className="text-[11px] text-slate-400 ml-1.5">{rep.user.title}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono">{rep.customerCount} 戶</td>
                  <td className="py-3 px-3 font-mono">{rep.activeDealsCount} 案</td>
                  <td className="py-3 px-3 font-mono font-medium text-indigo-700">
                    {formatCurrency(rep.activeValue)}
                  </td>
                  <td className="py-3 px-3 font-mono text-emerald-700 font-bold">
                    {rep.wonCount} 案
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(rep.wonValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
