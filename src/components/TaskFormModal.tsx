import React, { useState } from 'react';
import { X, Calendar, CheckSquare, User, Building } from 'lucide-react';
import { Task, TaskPriority } from '../types/crm';
import { useCRM } from '../context/CRMContext';

interface TaskFormModalProps {
  task?: Task | null;
  defaultCustomerId?: string;
  onClose: () => void;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  task,
  defaultCustomerId,
  onClose,
}) => {
  const { customers, addTask, updateTask, users, currentUser } = useCRM();

  const [title, setTitle] = useState(task?.title || '');
  const [customerId, setCustomerId] = useState(task?.customerId || defaultCustomerId || '');
  const [dueDate, setDueDate] = useState(task?.dueDate || '2026-10-15');
  const [dueTime, setDueTime] = useState(task?.dueTime || '14:00');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'high');
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo || currentUser.name);
  const [notes, setNotes] = useState(task?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matchedCustomer = customerId ? customers.find(c => c.id === customerId) : undefined;

    if (task) {
      updateTask(task.id, {
        title: title.trim(),
        customerId: customerId || undefined,
        customerName: matchedCustomer?.companyName,
        dueDate,
        dueTime: dueTime || undefined,
        priority,
        assignedTo,
        notes: notes.trim() || undefined,
      });
    } else {
      addTask({
        title: title.trim(),
        customerId: customerId || undefined,
        customerName: matchedCustomer?.companyName,
        dueDate,
        dueTime: dueTime || undefined,
        priority,
        completed: false,
        assignedTo,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              {task ? '編輯跟進待辦' : '新增跟進待辦任務'}
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
              待辦任務標題 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如: 致電確認合約第 5 條修改意見"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              關聯客戶 (可選)
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">-- 不指定關聯客戶 (一般待辦) --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.contactPerson})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                截止日期 <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                預定時間
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                優先級別
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="urgent">緊急要件 (立即處理)</option>
                <option value="high">高優先級 (重要客戶)</option>
                <option value="medium">中優先級 (日常跟進)</option>
                <option value="low">低優先級 (定期問候)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                指派負責人
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {users.map(u => (
                  <option key={u.id} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              任務補充筆記
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="需要攜帶之資料或特別準備事項..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
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
              {task ? '儲存變更' : '建立任務'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
