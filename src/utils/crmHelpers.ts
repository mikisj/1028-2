import { CustomerStatus, CustomerTier, DealStage, ActivityType, ActivityOutcome, TaskPriority } from '../types/crm';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
  }).format(amount).replace('TWD', 'NT$');
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('zh-TW').format(num);
};

export const getStatusMeta = (status: CustomerStatus): { label: string; colorClass: string; bgClass: string; borderClass: string } => {
  switch (status) {
    case 'lead':
      return { label: '潛在線索', colorClass: 'text-amber-700', bgClass: 'bg-amber-50', borderClass: 'border-amber-200' };
    case 'contacted':
      return { label: '初步接洽', colorClass: 'text-blue-700', bgClass: 'bg-blue-50', borderClass: 'border-blue-200' };
    case 'negotiating':
      return { label: '商洽議價中', colorClass: 'text-indigo-700', bgClass: 'bg-indigo-50', borderClass: 'border-indigo-200' };
    case 'customer':
      return { label: '正式成交客戶', colorClass: 'text-emerald-700', bgClass: 'bg-emerald-50', borderClass: 'border-emerald-200' };
    case 'churned':
      return { label: '已暫停/流失', colorClass: 'text-zinc-600', bgClass: 'bg-zinc-100', borderClass: 'border-zinc-200' };
  }
};

export const getTierMeta = (tier: CustomerTier): { label: string; colorClass: string; bgClass: string } => {
  switch (tier) {
    case 'VIP':
      return { label: 'VIP 核心大客', colorClass: 'text-purple-700', bgClass: 'bg-purple-50' };
    case 'A':
      return { label: 'A 級重點客', colorClass: 'text-blue-700', bgClass: 'bg-blue-50' };
    case 'B':
      return { label: 'B 級潛力客', colorClass: 'text-emerald-700', bgClass: 'bg-emerald-50' };
    case 'C':
      return { label: 'C 級一般客', colorClass: 'text-zinc-600', bgClass: 'bg-zinc-100' };
  }
};

export const getDealStageMeta = (stage: DealStage): { label: string; colorClass: string; bgClass: string; order: number } => {
  switch (stage) {
    case 'lead':
      return { label: '潛在商機', colorClass: 'text-slate-700', bgClass: 'bg-slate-100', order: 1 };
    case 'qualified':
      return { label: '需求確認', colorClass: 'text-blue-700', bgClass: 'bg-blue-50', order: 2 };
    case 'proposal':
      return { label: '方案報價', colorClass: 'text-indigo-700', bgClass: 'bg-indigo-50', order: 3 };
    case 'negotiating':
      return { label: '商務談判', colorClass: 'text-amber-700', bgClass: 'bg-amber-50', order: 4 };
    case 'won':
      return { label: '贏單成交', colorClass: 'text-emerald-700', bgClass: 'bg-emerald-50', order: 5 };
    case 'lost':
    default:
      return { label: '輸單結案', colorClass: 'text-rose-700', bgClass: 'bg-rose-50', order: 6 };
  }
};

export const getActivityTypeMeta = (type: ActivityType): { label: string; colorClass: string } => {
  switch (type) {
    case 'meeting':
      return { label: '實體/線上會議', colorClass: 'text-indigo-600' };
    case 'call':
      return { label: '電話溝通', colorClass: 'text-blue-600' };
    case 'email':
      return { label: '電子郵件', colorClass: 'text-sky-600' };
    case 'line':
      return { label: 'LINE / 即時通訊', colorClass: 'text-emerald-600' };
    case 'proposal':
      return { label: '提案簡報/送交', colorClass: 'text-amber-600' };
    case 'note':
      return { label: '備忘紀錄', colorClass: 'text-zinc-600' };
  }
};

export const getActivityOutcomeMeta = (outcome: ActivityOutcome): { label: string; colorClass: string } => {
  switch (outcome) {
    case 'positive':
      return { label: '正面樂觀', colorClass: 'text-emerald-600' };
    case 'neutral':
      return { label: '一般中立', colorClass: 'text-slate-600' };
    case 'negative':
      return { label: '進度受阻', colorClass: 'text-rose-600' };
  }
};

export const getPriorityMeta = (priority: TaskPriority): { label: string; colorClass: string; bgClass: string } => {
  switch (priority) {
    case 'urgent':
      return { label: '緊急要件', colorClass: 'text-rose-700', bgClass: 'bg-rose-50' };
    case 'high':
      return { label: '高優先級', colorClass: 'text-amber-700', bgClass: 'bg-amber-50' };
    case 'medium':
      return { label: '中優先級', colorClass: 'text-blue-700', bgClass: 'bg-blue-50' };
    case 'low':
      return { label: '低優先級', colorClass: 'text-slate-600', bgClass: 'bg-slate-100' };
  }
};

export const formatRelativeDate = (dateStr: string): string => {
  if (!dateStr) return '無紀錄';
  const target = new Date(dateStr);
  const now = new Date('2026-10-12T23:17:00'); // Based on local system date
  const diffDays = Math.floor((now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays === -1) return '明天';
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} 天後`;
  if (diffDays > 0 && diffDays <= 7) return `${diffDays} 天前`;
  return dateStr.slice(0, 10);
};
