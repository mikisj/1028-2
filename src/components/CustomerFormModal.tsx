import React, { useState, useEffect } from 'react';
import { X, Building, User, Phone, Mail, MapPin, Tag, DollarSign } from 'lucide-react';
import { Customer, CustomerTier, CustomerStatus, CustomerSource } from '../types/crm';
import { useCRM } from '../context/CRMContext';

interface CustomerFormModalProps {
  customer?: Customer | null;
  onClose: () => void;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  customer,
  onClose,
}) => {
  const { addCustomer, updateCustomer, users, currentUser } = useCRM();

  const [companyName, setCompanyName] = useState(customer?.companyName || '');
  const [taxId, setTaxId] = useState(customer?.taxId || '');
  const [contactPerson, setContactPerson] = useState(customer?.contactPerson || '');
  const [title, setTitle] = useState(customer?.title || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [mobile, setMobile] = useState(customer?.mobile || '');
  const [address, setAddress] = useState(customer?.address || '');
  const [industry, setIndustry] = useState(customer?.industry || '資訊軟體');
  const [tier, setTier] = useState<CustomerTier>(customer?.tier || 'B');
  const [source, setSource] = useState<CustomerSource>(customer?.source || '線上諮詢');
  const [status, setStatus] = useState<CustomerStatus>(customer?.status || 'lead');
  const [assignedTo, setAssignedTo] = useState(customer?.assignedTo || currentUser.name);
  const [tagsInput, setTagsInput] = useState(customer?.tags.join(', ') || '');
  const [annualBudget, setAnnualBudget] = useState<string>(customer?.annualBudget ? String(customer.annualBudget) : '');
  const [notes, setNotes] = useState(customer?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactPerson.trim()) return;

    const parsedTags = tagsInput
      .split(/[,，]/)
      .map(t => t.trim())
      .filter(Boolean);

    const budgetNum = annualBudget ? parseInt(annualBudget, 10) : undefined;

    if (customer) {
      updateCustomer(customer.id, {
        companyName: companyName.trim(),
        taxId: taxId.trim() || undefined,
        contactPerson: contactPerson.trim(),
        title: title.trim(),
        email: email.trim(),
        phone: phone.trim(),
        mobile: mobile.trim() || undefined,
        address: address.trim() || undefined,
        industry,
        tier,
        source,
        status,
        assignedTo,
        tags: parsedTags,
        annualBudget: isNaN(budgetNum as number) ? undefined : budgetNum,
        notes: notes.trim() || undefined,
      });
    } else {
      addCustomer({
        companyName: companyName.trim(),
        taxId: taxId.trim() || undefined,
        contactPerson: contactPerson.trim(),
        title: title.trim(),
        email: email.trim(),
        phone: phone.trim(),
        mobile: mobile.trim() || undefined,
        address: address.trim() || undefined,
        industry,
        tier,
        source,
        status,
        assignedTo,
        tags: parsedTags,
        annualBudget: isNaN(budgetNum as number) ? undefined : budgetNum,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              {customer ? '編輯客戶基本資料' : '新增企業客戶檔案'}
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Company Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                客戶公司名稱 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="例如: 台灣積體積體科技股份有限公司"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Tax ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                統一編號 (統編 8 碼)
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="例如: 12345678"
                maxLength={8}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                主要聯絡人姓名 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="例如: 林經理、張總監"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                職稱
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如: 營運協理、採購主管"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                電子信箱 (Email) <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@company.tw"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                公司代表電話 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="例如: 02-2345-6789"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                手機號碼
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="例如: 0912-345-678"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                產業類別
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="資訊軟體">資訊軟體 / 雲端服務</option>
                <option value="生技醫療">生技醫療 / 醫藥</option>
                <option value="綠能環保">綠能環保 / ESG</option>
                <option value="智慧製造">智慧製造 / 工業自動化</option>
                <option value="餐飲服務">餐飲服務 / 連鎖加盟</option>
                <option value="物流運輸">物流運輸 / 供應鏈</option>
                <option value="專業顧問">專業顧問 / 事務所</option>
                <option value="數位行銷">數位行銷 / 廣告公關</option>
                <option value="金融保險">金融保險 / 投資理財</option>
                <option value="其他產業">其他產業</option>
              </select>
            </div>

            {/* Tier */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                客戶分級
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as CustomerTier)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="VIP">VIP 核心大客 (年度千萬級)</option>
                <option value="A">A 級重點客 (年度百萬級)</option>
                <option value="B">B 級潛力客 (年度五十萬級)</option>
                <option value="C">C 級一般客 (標準案量)</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                目前狀態
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CustomerStatus)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="lead">潛在線索 (進線未接觸)</option>
                <option value="contacted">初步接洽 (已通話或會議)</option>
                <option value="negotiating">商洽議價中 (出具報價案)</option>
                <option value="customer">正式成交客戶 (合約生效)</option>
                <option value="churned">已暫停 / 流失</option>
              </select>
            </div>

            {/* Source */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                獲客來源
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as CustomerSource)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="線上諮詢">官網線上填表諮詢</option>
                <option value="展會接觸">實體產業展會接觸</option>
                <option value="熟客轉介">老客戶或合作夥伴轉介</option>
                <option value="主動開發">業務團隊主動電話/拜訪</option>
                <option value="數位廣告">Google/FB 數位廣告</option>
                <option value="其他">其他途徑</option>
              </select>
            </div>

            {/* Assigned Owner */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                指派負責業務
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

            {/* Annual Budget */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                預估年度採購預算 (NT$)
              </label>
              <input
                type="number"
                value={annualBudget}
                onChange={(e) => setAnnualBudget(e.target.value)}
                placeholder="例如: 1500000"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                標籤分群 (以逗號分隔)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="例如: 雲端架構, 急單, 台北大客"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                公司通訊地址
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="例如: 台北市信義區松仁路 100 號 18 樓"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                內部備忘與背景筆記
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="記錄決策鏈、競品狀況、特別需求或溝通風格..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
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
              {customer ? '儲存變更' : '建立客戶檔案'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
