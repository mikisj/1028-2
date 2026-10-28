import React, { useState } from 'react';
import { X, Briefcase, DollarSign, Calendar, User, Building } from 'lucide-react';
import { Deal, DealStage } from '../types/crm';
import { useCRM } from '../context/CRMContext';

interface DealFormModalProps {
  deal?: Deal | null;
  defaultCustomerId?: string;
  onClose: () => void;
}

export const DealFormModal: React.FC<DealFormModalProps> = ({
  deal,
  defaultCustomerId,
  onClose,
}) => {
  const { customers, addDeal, updateDeal, users, currentUser } = useCRM();

  const [customerId, setCustomerId] = useState(deal?.customerId || defaultCustomerId || (customers[0]?.id || ''));
  const [title, setTitle] = useState(deal?.title || '');
  const [amount, setAmount] = useState<string>(deal?.amount ? String(deal.amount) : '');
  const [stage, setStage] = useState<DealStage>(deal?.stage || 'lead');
  const [probability, setProbability] = useState<number>(deal?.probability || 30);
  const [expectedCloseDate, setExpectedCloseDate] = useState(deal?.expectedCloseDate || '2026-11-30');
  const [assignedTo, setAssignedTo] = useState(deal?.assignedTo || currentUser.name);
  const [notes, setNotes] = useState(deal?.notes || '');

  // Handle stage change auto-update probability default
  const handleStageChange = (newStage: DealStage) => {
    setStage(newStage);
    if (!deal) {
      if (newStage === 'lead') setProbability(20);
      else if (newStage === 'qualified') setProbability(40);
      else if (newStage === 'proposal') setProbability(60);
      else if (newStage === 'negotiating') setProbability(80);
      else if (newStage === 'won') setProbability(100);
      else if (newStage === 'lost') setProbability(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !customerId) return;

    const matchedCustomer = customers.find(c => c.id === customerId);
    const customerName = matchedCustomer?.companyName || '未知客戶';
    const amountNum = parseInt(amount, 10) || 0;

    if (deal) {
      updateDeal(deal.id, {
        customerId,
        customerName,
        title: title.trim(),
        amount: amountNum,
        stage,
        probability,
        expectedCloseDate,
        assignedTo,
        notes: notes.trim() || undefined,
      });
    } else {
      addDeal({
        customerId,
        customerName,
        title: title.trim(),
        amount: amountNum,
        stage,
        probability,
        expectedCloseDate,
        assignedTo,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">
              {deal ? '編輯銷售商機' : '建立新銷售商機'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              關聯客戶 <span className="text-rose-500">*</span>
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.contactPerson})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              商機案名 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如: 2026 企業雲端儲存搬遷案"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                預估金額 (NT$) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="例如: 1200000"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                預計結案日期
              </label>
              <input
                type="date"
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                當前管道階段
              </label>
              <select
                value={stage}
                onChange={(e) => handleStageChange(e.target.value as DealStage)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="lead">1. 潛在商機 (初步建檔)</option>
                <option value="qualified">2. 需求確認 (規格討論)</option>
                <option value="proposal">3. 方案報價 (已送建議書)</option>
                <option value="negotiating">4. 商務談判 (合約審核)</option>
                <option value="won">5. 贏單成交 (簽署合約)</option>
                <option value="lost">6. 輸單結案 (中止)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                成交勝率 ({probability}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={probability}
                onChange={(e) => setProbability(Number(e.target.value))}
                className="w-full mt-2 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                負責業務
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {users.map(u => (
                  <option key={u.id} value={u.name}>{u.name} ({u.title})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                商機說明與專案備忘
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="記載交付週期、競標對象或特別付款條款..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer"
            >
              {deal ? '儲存變更' : '建立商機'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
