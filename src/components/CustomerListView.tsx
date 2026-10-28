import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutList, 
  LayoutGrid, 
  Phone, 
  Mail, 
  Building, 
  Tag, 
  User, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  ExternalLink,
  MessageSquare,
  FileSpreadsheet,
  CheckSquare,
  UserCheck
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Customer, CustomerTier, CustomerStatus } from '../types/crm';
import { formatCurrency, getTierMeta, getStatusMeta, formatRelativeDate } from '../utils/crmHelpers';

interface CustomerListViewProps {
  onOpenNewCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onLogActivityForCustomer: (customer: Customer) => void;
}

export const CustomerListView: React.FC<CustomerListViewProps> = ({
  onOpenNewCustomer,
  onEditCustomer,
  onLogActivityForCustomer,
}) => {
  const {
    customers,
    searchQuery,
    setSearchQuery,
    users,
    deleteCustomer,
    batchDeleteCustomers,
    batchUpdateOwner,
    batchAddTag,
    setSelectedCustomerId,
    exportCustomersCSV
  } = useCRM();

  // View mode
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Filters
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedOwner, setSelectedOwner] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'lastContact' | 'budget' | 'name' | 'created'>('lastContact');

  // Batch selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBatchOwnerModal, setShowBatchOwnerModal] = useState(false);
  const [batchTargetOwner, setBatchTargetOwner] = useState(users[0]?.name || '');
  const [showBatchTagModal, setShowBatchTagModal] = useState(false);
  const [batchTargetTag, setBatchTargetTag] = useState('');

  // Collect distinct industries
  const industries = useMemo(() => {
    const set = new Set<string>();
    customers.forEach(c => {
      if (c.industry) set.add(c.industry);
    });
    return Array.from(set);
  }, [customers]);

  // Filtered & sorted customers
  const filteredCustomers = useMemo(() => {
    return customers
      .filter(c => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchCompany = c.companyName.toLowerCase().includes(q);
          const matchContact = c.contactPerson.toLowerCase().includes(q);
          const matchTax = c.taxId?.toLowerCase().includes(q) || false;
          const matchEmail = c.email.toLowerCase().includes(q);
          const matchPhone = c.phone.includes(q) || (c.mobile?.includes(q) || false);
          const matchTag = c.tags.some(t => t.toLowerCase().includes(q));
          if (!matchCompany && !matchContact && !matchTax && !matchEmail && !matchPhone && !matchTag) {
            return false;
          }
        }

        // Tier
        if (selectedTier !== 'all' && c.tier !== selectedTier) return false;

        // Status
        if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;

        // Industry
        if (selectedIndustry !== 'all' && c.industry !== selectedIndustry) return false;

        // Owner
        if (selectedOwner !== 'all' && c.assignedTo !== selectedOwner) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'lastContact') {
          return (b.lastContactAt || '').localeCompare(a.lastContactAt || '');
        }
        if (sortBy === 'budget') {
          return (b.annualBudget || 0) - (a.annualBudget || 0);
        }
        if (sortBy === 'created') {
          return b.createdAt.localeCompare(a.createdAt);
        }
        if (sortBy === 'name') {
          return a.companyName.localeCompare(b.companyName, 'zh-Hant');
        }
        return 0;
      });
  }, [customers, searchQuery, selectedTier, selectedStatus, selectedIndustry, selectedOwner, sortBy]);

  // Selection toggle
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCustomers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCustomers.map(c => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = () => {
    if (window.confirm(`確定要刪除已選取的 ${selectedIds.length} 筆客戶資料嗎？此操作將同時移除其關聯活動與商機。`)) {
      batchDeleteCustomers(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleApplyBatchOwner = () => {
    if (batchTargetOwner) {
      batchUpdateOwner(selectedIds, batchTargetOwner);
      setShowBatchOwnerModal(false);
      setSelectedIds([]);
    }
  };

  const handleApplyBatchTag = () => {
    if (batchTargetTag.trim()) {
      batchAddTag(selectedIds, batchTargetTag.trim());
      setShowBatchTagModal(false);
      setBatchTargetTag('');
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              客戶名冊與 360° 檔案庫
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-mono font-semibold text-slate-700">
              共 {customers.length} 筆
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            管理企業客戶基本資訊、聯絡人、拜訪紀錄與客製化標籤分群。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCustomersCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="匯出為 CSV 試算表"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>匯出 CSV</span>
          </button>

          <button
            onClick={onOpenNewCustomer}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>新增客戶檔案</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Search box inside toolbar */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋關鍵字、統編、電話..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
            />
          </div>

          {/* Tier Filter */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 cursor-pointer focus:outline-none"
          >
            <option value="all">等級分級：全部</option>
            <option value="VIP">VIP 核心大客</option>
            <option value="A">A 級重點客</option>
            <option value="B">B 級潛力客</option>
            <option value="C">C 級一般客</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 cursor-pointer focus:outline-none"
          >
            <option value="all">客戶狀態：全部</option>
            <option value="lead">潛在線索</option>
            <option value="contacted">初步接洽</option>
            <option value="negotiating">商洽議價中</option>
            <option value="customer">正式成交客戶</option>
            <option value="churned">已暫停/流失</option>
          </select>

          {/* Industry Filter */}
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 cursor-pointer focus:outline-none"
          >
            <option value="all">產業類別：全部</option>
            {industries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>

          {/* Assigned Owner Filter */}
          <select
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 cursor-pointer focus:outline-none"
          >
            <option value="all">負責業務：全部</option>
            {users.map(u => (
              <option key={u.id} value={u.name}>{u.name}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 cursor-pointer focus:outline-none ml-auto"
          >
            <option value="lastContact">排序：最後聯絡 (新→舊)</option>
            <option value="budget">排序：預算金額 (高→低)</option>
            <option value="created">排序：建檔時間 (新→舊)</option>
            <option value="name">排序：公司名稱筆畫</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
            <button
              onClick={() => setViewMode('table')}
              title="表格清單視圖"
              className={`p-1.5 transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="卡片網格視圖"
              className={`p-1.5 transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Reset filter shortcut if active */}
        {(selectedTier !== 'all' || selectedStatus !== 'all' || selectedIndustry !== 'all' || selectedOwner !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
            <span>篩選結果：共 {filteredCustomers.length} 筆</span>
            <button
              onClick={() => {
                setSelectedTier('all');
                setSelectedStatus('all');
                setSelectedIndustry('all');
                setSelectedOwner('all');
                setSearchQuery('');
              }}
              className="text-indigo-600 hover:underline cursor-pointer"
            >
              重置所有篩選
            </button>
          </div>
        )}
      </div>

      {/* Floating / Inline Batch Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-900 text-white p-3 rounded-xl flex items-center justify-between shadow-md text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <span className="font-semibold bg-indigo-700 px-2 py-0.5 rounded">
              已選取 {selectedIds.length} 筆客戶
            </span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-indigo-200 hover:text-white underline cursor-pointer"
            >
              取消選取
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBatchOwnerModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-800 hover:bg-indigo-700 rounded text-white cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>變更負責人</span>
            </button>

            <button
              onClick={() => setShowBatchTagModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-800 hover:bg-indigo-700 rounded text-white cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>新增標籤</span>
            </button>

            <button
              onClick={handleBatchDelete}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 rounded text-white cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>批次刪除</span>
            </button>
          </div>
        </div>
      )}

      {/* View Content: Table or Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">查無符合條件的客戶</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            建議嘗試調整搜尋關鍵字或清除篩選條件，也可以直接點擊下方按鈕建立新客戶檔案。
          </p>
          <button
            onClick={onOpenNewCustomer}
            className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            建立新客戶檔案
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredCustomers.length && filteredCustomers.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3.5">客戶名稱 / 統編</th>
                  <th className="py-3 px-3.5">主要聯絡人</th>
                  <th className="py-3 px-3.5">聯絡管道</th>
                  <th className="py-3 px-3.5">分級</th>
                  <th className="py-3 px-3.5">階段狀態</th>
                  <th className="py-3 px-3.5">產業</th>
                  <th className="py-3 px-3.5">負責業務</th>
                  <th className="py-3 px-3.5">最後聯絡</th>
                  <th className="py-3 px-3.5 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCustomers.map(cust => {
                  const tierMeta = getTierMeta(cust.tier);
                  const statusMeta = getStatusMeta(cust.status);
                  const isChecked = selectedIds.includes(cust.id);

                  return (
                    <tr
                      key={cust.id}
                      className={`hover:bg-slate-50/80 transition-colors ${isChecked ? 'bg-indigo-50/40' : ''}`}
                    >
                      <td className="py-3.5 px-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(cust.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* Company Name & Tax ID */}
                      <td className="py-3.5 px-3.5">
                        <button
                          onClick={() => setSelectedCustomerId(cust.id)}
                          className="font-bold text-slate-900 hover:text-indigo-600 text-left transition-colors flex items-center gap-1.5 group cursor-pointer"
                        >
                          <span>{cust.companyName}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                          {cust.taxId && <span>統編: {cust.taxId}</span>}
                          {cust.tags.length > 0 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="truncate max-w-[150px]">{cust.tags.slice(0, 2).join(', ')}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Contact person */}
                      <td className="py-3.5 px-3.5">
                        <div className="font-medium text-slate-900">{cust.contactPerson}</div>
                        <div className="text-[11px] text-slate-400">{cust.title}</div>
                      </td>

                      {/* Contact methods */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex items-center gap-2 text-slate-600">
                          {cust.phone && (
                            <a
                              href={`tel:${cust.phone}`}
                              title={cust.phone}
                              className="p-1 hover:text-indigo-600 hover:bg-slate-100 rounded"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {cust.email && (
                            <a
                              href={`mailto:${cust.email}`}
                              title={cust.email}
                              className="p-1 hover:text-indigo-600 hover:bg-slate-100 rounded"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <span className="text-[11px] text-slate-500 font-mono">
                            {cust.phone || cust.mobile}
                          </span>
                        </div>
                      </td>

                      {/* Tier */}
                      <td className="py-3.5 px-3.5">
                        <span className={`font-semibold ${tierMeta.colorClass}`}>
                          {cust.tier}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3.5">
                        <span className={`font-medium ${statusMeta.colorClass}`}>
                          {statusMeta.label}
                        </span>
                      </td>

                      {/* Industry */}
                      <td className="py-3.5 px-3.5 text-slate-600">
                        {cust.industry}
                      </td>

                      {/* Assigned Owner */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex items-center gap-1.5 text-slate-800">
                          <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                            {cust.assignedTo.slice(0, 1)}
                          </div>
                          <span>{cust.assignedTo}</span>
                        </div>
                      </td>

                      {/* Last contact */}
                      <td className="py-3.5 px-3.5 text-slate-500 font-mono text-[11px]">
                        {formatRelativeDate(cust.lastContactAt || '')}
                      </td>

                      {/* Operations */}
                      <td className="py-3.5 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onLogActivityForCustomer(cust)}
                            title="紀錄互動日誌"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditCustomer(cust)}
                            title="編輯資料"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`確定要刪除「${cust.companyName}」嗎？`)) {
                                deleteCustomer(cust.id);
                              }
                            }}
                            title="刪除"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
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
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map(cust => {
            const tierMeta = getTierMeta(cust.tier);
            const statusMeta = getStatusMeta(cust.status);
            const isChecked = selectedIds.includes(cust.id);

            return (
              <div
                key={cust.id}
                className={`bg-white rounded-xl border p-4.5 space-y-3 hover:border-indigo-300 transition-all shadow-xs ${
                  isChecked ? 'border-indigo-400 bg-indigo-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelect(cust.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className={`text-xs font-semibold ${tierMeta.colorClass}`}>
                      {tierMeta.label}
                    </span>
                  </div>
                  <span className={`text-xs font-medium ${statusMeta.colorClass}`}>
                    {statusMeta.label}
                  </span>
                </div>

                <div>
                  <button
                    onClick={() => setSelectedCustomerId(cust.id)}
                    className="font-bold text-slate-900 hover:text-indigo-600 text-base text-left transition-colors cursor-pointer block"
                  >
                    {cust.companyName}
                  </button>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {cust.industry} {cust.taxId ? `· 統編 ${cust.taxId}` : ''}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 text-xs space-y-1 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">主要窗口:</span>
                    <span className="font-medium text-slate-800">{cust.contactPerson} ({cust.title})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">聯絡電話:</span>
                    <span className="font-mono">{cust.phone || cust.mobile}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">負責業務:</span>
                    <span className="font-medium text-slate-800">{cust.assignedTo}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    最後聯絡: {formatRelativeDate(cust.lastContactAt || '')}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onLogActivityForCustomer(cust)}
                      className="px-2 py-1 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded text-xs font-medium cursor-pointer"
                    >
                      紀錄日誌
                    </button>
                    <button
                      onClick={() => setSelectedCustomerId(cust.id)}
                      className="px-2.5 py-1 text-white bg-indigo-600 hover:bg-indigo-700 rounded text-xs font-medium cursor-pointer"
                    >
                      360° 詳情
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Batch Assign Modal */}
      {showBatchOwnerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-900 text-base">
              批次更換負責業務 ({selectedIds.length} 筆客戶)
            </h3>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                選擇新的指派業務員
              </label>
              <select
                value={batchTargetOwner}
                onChange={(e) => setBatchTargetOwner(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {users.map(u => (
                  <option key={u.id} value={u.name}>{u.name} ({u.title})</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBatchOwnerModal(false)}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleApplyBatchOwner}
                className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
              >
                確定指派
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Tag Modal */}
      {showBatchTagModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-900 text-base">
              批次新增分類標籤 ({selectedIds.length} 筆客戶)
            </h3>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                輸入要加入的標籤名稱
              </label>
              <input
                type="text"
                value={batchTargetTag}
                onChange={(e) => setBatchTargetTag(e.target.value)}
                placeholder="例如: 2026參展、重點拜訪名單"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBatchTagModal(false)}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleApplyBatchTag}
                className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
              >
                加入標籤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
