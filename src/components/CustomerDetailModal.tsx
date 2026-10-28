import React, { useState } from 'react';
import { 
  X, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  Calendar, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  Tag, 
  MessageSquare, 
  DollarSign,
  Send,
  FileText
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { ActivityType, ActivityOutcome, DealStage, TaskPriority } from '../types/crm';
import { 
  formatCurrency, 
  getTierMeta, 
  getStatusMeta, 
  getActivityTypeMeta, 
  getActivityOutcomeMeta, 
  getDealStageMeta,
  getPriorityMeta
} from '../utils/crmHelpers';

interface CustomerDetailModalProps {
  onClose: () => void;
  onEditCustomer: () => void;
  onAddDealForCustomer: () => void;
  onAddTaskForCustomer: () => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  onClose,
  onEditCustomer,
  onAddDealForCustomer,
  onAddTaskForCustomer,
}) => {
  const { 
    selectedCustomerId, 
    customers, 
    activities, 
    deals, 
    tasks, 
    currentUser,
    addActivity, 
    deleteActivity,
    toggleTask,
    updateCustomer
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'timeline' | 'deals' | 'tasks' | 'info'>('timeline');

  // Activity Quick Logger Form State
  const [actType, setActType] = useState<ActivityType>('meeting');
  const [actTitle, setActTitle] = useState('');
  const [actContent, setActContent] = useState('');
  const [actOutcome, setActOutcome] = useState<ActivityOutcome>('positive');
  const [actNextStep, setActNextStep] = useState('');
  const [actNextDate, setActNextDate] = useState('');

  // New Tag input
  const [newTagInput, setNewTagInput] = useState('');

  const customer = customers.find(c => c.id === selectedCustomerId);

  if (!customer) return null;

  const customerActivities = activities.filter(a => a.customerId === customer.id);
  const customerDeals = deals.filter(d => d.customerId === customer.id);
  const customerTasks = tasks.filter(t => t.customerId === customer.id);

  const tierMeta = getTierMeta(customer.tier);
  const statusMeta = getStatusMeta(customer.status);

  // Handle logging activity
  const handleSubmitActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle.trim() || !actContent.trim()) return;

    addActivity({
      customerId: customer.id,
      customerName: customer.companyName,
      type: actType,
      title: actTitle.trim(),
      content: actContent.trim(),
      outcome: actOutcome,
      nextStep: actNextStep.trim() || undefined,
      nextFollowUpDate: actNextDate || undefined,
      loggedBy: currentUser.name,
    });

    setActTitle('');
    setActContent('');
    setActNextStep('');
    setActNextDate('');
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !customer.tags.includes(newTagInput.trim())) {
      updateCustomer(customer.id, {
        tags: [...customer.tags, newTagInput.trim()]
      });
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateCustomer(customer.id, {
      tags: customer.tags.filter(t => t !== tagToRemove)
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tierMeta.bgClass} ${tierMeta.colorClass}`}>
                  {tierMeta.label}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusMeta.bgClass} ${statusMeta.colorClass}`}>
                  {statusMeta.label}
                </span>
                <span className="text-xs text-slate-500">
                  {customer.industry}
                </span>
                {customer.taxId && (
                  <span className="text-xs text-slate-400 font-mono">
                    統編: {customer.taxId}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {customer.companyName}
              </h2>

              <div className="flex items-center gap-4 mt-2 text-xs text-slate-600 flex-wrap">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {customer.contactPerson} ({customer.title})
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {customer.phone || customer.mobile}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {customer.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onEditCustomer}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                title="編輯客戶基本資料"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200 text-xs">
            {customer.phone && (
              <a
                href={`tel:${customer.phone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-indigo-600" />
                <span>撥打電話</span>
              </a>
            )}
            {customer.email && (
              <a
                href={`mailto:${customer.email}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                <span>發送郵件</span>
              </a>
            )}
            <button
              onClick={onAddDealForCustomer}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-amber-400 hover:text-amber-700 transition-colors cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5 text-amber-600" />
              <span>建立商機</span>
            </button>
            <button
              onClick={onAddTaskForCustomer}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-emerald-400 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>排程待辦</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 px-6 bg-white gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>互動日誌歷程 ({customerActivities.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('deals')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'deals'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>關聯商機 ({customerDeals.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>待辦排程 ({customerTasks.filter(t => !t.completed).length})</span>
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>基本檔案與備忘</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/40">
          {/* TAB 1: ACTIVITY TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* Add Activity Form Card */}
              <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                    新增本次跟進 / 拜訪記錄
                  </span>
                  <span className="text-slate-400">紀錄人員: {currentUser.name}</span>
                </div>

                <form onSubmit={handleSubmitActivity} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        互動方式
                      </label>
                      <select
                        value={actType}
                        onChange={(e) => setActType(e.target.value as ActivityType)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="meeting">實體/線上會議</option>
                        <option value="call">電話溝通</option>
                        <option value="proposal">提案送交 / 報價簡報</option>
                        <option value="email">電子郵件交流</option>
                        <option value="line">LINE / 即時通訊</option>
                        <option value="note">備忘隨筆</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        客戶回饋態度
                      </label>
                      <select
                        value={actOutcome}
                        onChange={(e) => setActOutcome(e.target.value as ActivityOutcome)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="positive">正面樂觀 (高意願)</option>
                        <option value="neutral">一般中立 (評估中)</option>
                        <option value="negative">進度受阻 (需排解疑慮)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      溝通主題
                    </label>
                    <input
                      type="text"
                      value={actTitle}
                      onChange={(e) => setActTitle(e.target.value)}
                      placeholder="例如: Q4 方案規格審閱、報價單條款答辯..."
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      洽談要點摘要與客戶反饋
                    </label>
                    <textarea
                      rows={3}
                      value={actContent}
                      onChange={(e) => setActContent(e.target.value)}
                      placeholder="記錄雙方共識、技術需求、預算考慮或異議..."
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        下一步行動 (將自動排入待辦)
                      </label>
                      <input
                        type="text"
                        value={actNextStep}
                        onChange={(e) => setActNextStep(e.target.value)}
                        placeholder="例如: 寄發修正版報價單"
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        預計下次跟進日期
                      </label>
                      <input
                        type="date"
                        value={actNextDate}
                        onChange={(e) => setActNextDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>儲存互動紀錄</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Timeline Items */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  歷史跟進歷程 ({customerActivities.length} 則)
                </h3>

                {customerActivities.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
                    目前尚無互動紀錄，請於上方表單建立第一筆跟進紀錄。
                  </div>
                ) : (
                  customerActivities.map(act => {
                    const typeMeta = getActivityTypeMeta(act.type);
                    const outcomeMeta = getActivityOutcomeMeta(act.outcome);

                    return (
                      <div
                        key={act.id}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2 relative group"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${typeMeta.colorClass}`}>
                              [{typeMeta.label}]
                            </span>
                            <span className="font-bold text-slate-900">{act.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-medium ${outcomeMeta.colorClass}`}>
                              {outcomeMeta.label}
                            </span>
                            <span className="text-slate-400 font-mono text-[11px]">
                              {act.createdAt}
                            </span>
                            <button
                              onClick={() => deleteActivity(act.id)}
                              className="text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                              title="刪除紀錄"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {act.content}
                        </p>

                        {(act.nextStep || act.nextFollowUpDate) && (
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                            {act.nextStep && (
                              <span className="text-indigo-600 font-medium">
                                下一步: {act.nextStep}
                              </span>
                            )}
                            {act.nextFollowUpDate && (
                              <span className="text-slate-500 font-mono">
                                預定追蹤日: {act.nextFollowUpDate}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="text-[10px] text-slate-400 text-right">
                          紀錄人員: {act.loggedBy}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DEALS */}
          {activeTab === 'deals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    關聯商機項目
                  </h3>
                  <p className="text-xs text-slate-500">
                    此客戶歷來所有銷售商機與投標案
                  </p>
                </div>
                <button
                  onClick={onAddDealForCustomer}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>新增商機</span>
                </button>
              </div>

              {customerDeals.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
                  此客戶目前沒有建立中的銷售商機。
                </div>
              ) : (
                <div className="space-y-3">
                  {customerDeals.map(deal => {
                    const stageMeta = getDealStageMeta(deal.stage);
                    return (
                      <div
                        key={deal.id}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900 text-sm">
                            {deal.title}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${stageMeta.bgClass} ${stageMeta.colorClass}`}>
                            {stageMeta.label}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-lg font-bold font-mono text-slate-900">
                            {formatCurrency(deal.amount)}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            預估結案: {deal.expectedCloseDate} (勝率 {deal.probability}%)
                          </span>
                        </div>

                        {deal.notes && (
                          <p className="text-xs text-slate-500 pt-1 border-t border-slate-100">
                            {deal.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    專屬跟進排程
                  </h3>
                  <p className="text-xs text-slate-500">
                    針對此客戶預定的拜訪、報價與電話跟進
                  </p>
                </div>
                <button
                  onClick={onAddTaskForCustomer}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>排程待辦</span>
                </button>
              </div>

              {customerTasks.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
                  此客戶目前無排定的待辦事項。
                </div>
              ) : (
                <div className="space-y-2.5">
                  {customerTasks.map(task => {
                    const priorityMeta = getPriorityMeta(task.priority);
                    return (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-xl border bg-white flex items-start gap-3 transition-colors ${
                          task.completed ? 'border-slate-200 bg-slate-50/60 opacity-60' : 'border-slate-200'
                        }`}
                      >
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="mt-0.5 text-slate-400 hover:text-indigo-600 cursor-pointer"
                        >
                          <CheckCircle2 className={`w-4 h-4 ${task.completed ? 'text-emerald-600 fill-emerald-50' : ''}`} />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-xs">
                            <span className={`font-semibold text-slate-800 ${task.completed ? 'line-through text-slate-400' : ''}`}>
                              {task.title}
                            </span>
                            <span className={`text-[11px] font-medium ${priorityMeta.colorClass}`}>
                              {priorityMeta.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                            <span>截止: {task.dueDate} {task.dueTime || ''}</span>
                            <span>指派: {task.assignedTo}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COMPLETE INFO & NOTES */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Detailed Fields Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  公司聯絡檔案
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">統一編號 (統編)</span>
                    <span className="font-mono font-medium text-slate-800">{customer.taxId || '未提供'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">年度預算估計</span>
                    <span className="font-mono font-medium text-slate-800">
                      {customer.annualBudget ? formatCurrency(customer.annualBudget) : '未設定'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">主要聯絡人 / 職稱</span>
                    <span className="font-medium text-slate-800">{customer.contactPerson} ({customer.title})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">負責業務代表</span>
                    <span className="font-medium text-slate-800">{customer.assignedTo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">公司電話</span>
                    <span className="font-mono text-slate-800">{customer.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">行動電話 (手機)</span>
                    <span className="font-mono text-slate-800">{customer.mobile || '無'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">電子郵件信箱</span>
                    <span className="text-slate-800">{customer.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">客戶來源管道</span>
                    <span className="text-slate-800">{customer.source}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block mb-0.5">公司通訊地址</span>
                    <span className="text-slate-800">{customer.address || '未提供'}</span>
                  </div>
                </div>
              </div>

              {/* Tags Management */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  客製化業務標籤
                </h3>

                <div className="flex flex-wrap gap-2 items-center">
                  {customer.tags.map(t => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium"
                    >
                      {t}
                      <button
                        onClick={() => handleRemoveTag(t)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="新增標籤..."
                      className="px-2 py-1 text-xs border border-slate-200 rounded-md w-24 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Internal Notes */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  內部戰略備忘筆記
                </h3>
                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {customer.notes || '尚無特別備忘紀錄。'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
