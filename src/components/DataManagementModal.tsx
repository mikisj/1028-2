import React, { useState } from 'react';
import { X, Download, Upload, RotateCcw, FileSpreadsheet, Database, Check, AlertTriangle } from 'lucide-react';
import { useCRM } from '../context/CRMContext';

interface DataManagementModalProps {
  onClose: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({ onClose }) => {
  const { 
    customers, 
    deals, 
    tasks, 
    activities, 
    exportDataJSON, 
    exportCustomersCSV, 
    importDataJSON, 
    resetToDefaults 
  } = useCRM();

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataJSON(content);
      if (success) {
        setImportStatus('資料還原成功！系統已更新。');
        setTimeout(() => {
          setImportStatus(null);
          onClose();
        }, 1500);
      } else {
        setImportStatus('匯入失敗：檔案格式不符合規範。');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    resetToDefaults();
    setShowResetConfirm(false);
    setImportStatus('已成功恢復出廠範例資料！');
    setTimeout(() => {
      setImportStatus(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              資料管理、備份與還原
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 text-xs">
          {importStatus && (
            <div className={`p-3 rounded-lg flex items-center gap-2 font-medium ${
              importStatus.includes('成功') ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
            }`}>
              <Check className="w-4 h-4" />
              <span>{importStatus}</span>
            </div>
          )}

          {/* Current Stats */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800 block mb-1">本機儲存容量統計</span>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <span>客戶檔案：<strong className="text-slate-900 font-mono">{customers.length}</strong> 筆</span>
              <span>銷售商機：<strong className="text-slate-900 font-mono">{deals.length}</strong> 案</span>
              <span>互動日誌：<strong className="text-slate-900 font-mono">{activities.length}</strong> 則</span>
              <span>跟進待辦：<strong className="text-slate-900 font-mono">{tasks.length}</strong> 項</span>
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              1. 資料匯出與備份
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={exportCustomersCSV}
                className="p-3 border border-slate-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50/30 transition-all flex items-center gap-3 text-left cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-emerald-700">匯出客戶名錄 (CSV)</div>
                  <div className="text-[11px] text-slate-500">相容 Excel / Google 試算表</div>
                </div>
              </button>

              <button
                onClick={exportDataJSON}
                className="p-3 border border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50/30 transition-all flex items-center gap-3 text-left cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-indigo-700">完整系統備份 (JSON)</div>
                  <div className="text-[11px] text-slate-500">包含客戶、日誌、商機、任務</div>
                </div>
              </button>
            </div>
          </div>

          {/* Import Option */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              2. 備份檔還原
            </h3>
            <label className="p-3 border border-dashed border-slate-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50/20 transition-all flex items-center justify-center gap-2 text-slate-600 hover:text-indigo-700 cursor-pointer block text-center">
              <Upload className="w-4 h-4 text-indigo-600 inline" />
              <span className="font-medium">上傳並還原備份檔案 (.json)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset Defaults */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              3. 出廠資料重置
            </h3>
            {showResetConfirm ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-2">
                <div className="flex items-center gap-1.5 text-rose-800 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  確認恢復出廠範例資料？
                </div>
                <p className="text-[11px] text-rose-700">
                  此操作將清除目前新增之資料，並重載包含宏威雲端、綠能環境、豐華生醫等示範資料。
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-700 cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-3 py-1 bg-rose-600 text-white rounded font-medium hover:bg-rose-700 cursor-pointer"
                  >
                    確定重置
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                重設為系統預設範例資料 (Demo Data)
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
