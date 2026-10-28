import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, Activity, Deal, Task, SalesUser, ActiveNavTab, DealStage } from '../types/crm';
import { INITIAL_CUSTOMERS, INITIAL_ACTIVITIES, INITIAL_DEALS, INITIAL_TASKS, INITIAL_SALES_USERS } from '../data/mockData';

interface CRMContextType {
  customers: Customer[];
  activities: Activity[];
  deals: Deal[];
  tasks: Task[];
  users: SalesUser[];
  currentUser: SalesUser;
  setCurrentUser: (u: SalesUser) => void;
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  
  // Customer Actions
  addCustomer: (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Customer;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  batchDeleteCustomers: (ids: string[]) => void;
  batchUpdateOwner: (ids: string[], newOwner: string) => void;
  batchAddTag: (ids: string[], tag: string) => void;

  // Activity Actions
  addActivity: (data: Omit<Activity, 'id' | 'createdAt'>) => Activity;
  deleteActivity: (id: string) => void;

  // Deal Actions
  addDeal: (data: Omit<Deal, 'id' | 'createdAt'>) => Deal;
  updateDeal: (id: string, data: Partial<Deal>) => void;
  updateDealStage: (id: string, stage: DealStage) => void;
  deleteDeal: (id: string) => void;

  // Task Actions
  addTask: (data: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, data: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  // Utility Actions
  exportDataJSON: () => void;
  exportCustomersCSV: () => void;
  importDataJSON: (jsonData: string) => boolean;
  resetToDefaults: () => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CUSTOMERS: 'crm_customers_v1',
  ACTIVITIES: 'crm_activities_v1',
  DEALS: 'crm_deals_v1',
  TASKS: 'crm_tasks_v1',
  CURRENT_USER: 'crm_current_user_v1',
};

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<SalesUser[]>(INITIAL_SALES_USERS);
  const [currentUser, setCurrentUser] = useState<SalesUser>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_SALES_USERS[0];
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_CUSTOMERS;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_ACTIVITIES;
  });

  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEALS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_DEALS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_TASKS;
  });

  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  // Customer Actions
  const addCustomer = (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer => {
    const now = new Date().toISOString().slice(0, 10);
    const newCustomer: Customer = {
      ...data,
      id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: now,
      updatedAt: now,
      lastContactAt: data.lastContactAt || now,
    };
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    const now = new Date().toISOString().slice(0, 10);
    setCustomers(prev =>
      prev.map(c => (c.id === id ? { ...c, ...data, updatedAt: now } : c))
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    setDeals(prev => prev.filter(d => d.customerId !== id));
    setActivities(prev => prev.filter(a => a.customerId !== id));
    setTasks(prev => prev.filter(t => t.customerId !== id));
    if (selectedCustomerId === id) {
      setSelectedCustomerId(null);
    }
  };

  const batchDeleteCustomers = (ids: string[]) => {
    const idSet = new Set(ids);
    setCustomers(prev => prev.filter(c => !idSet.has(c.id)));
    setDeals(prev => prev.filter(d => !idSet.has(d.customerId)));
    setActivities(prev => prev.filter(a => !idSet.has(a.customerId)));
    setTasks(prev => prev.filter(t => !t.customerId || !idSet.has(t.customerId)));
    if (selectedCustomerId && idSet.has(selectedCustomerId)) {
      setSelectedCustomerId(null);
    }
  };

  const batchUpdateOwner = (ids: string[], newOwner: string) => {
    const idSet = new Set(ids);
    const now = new Date().toISOString().slice(0, 10);
    setCustomers(prev =>
      prev.map(c => (idSet.has(c.id) ? { ...c, assignedTo: newOwner, updatedAt: now } : c))
    );
  };

  const batchAddTag = (ids: string[], tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    const idSet = new Set(ids);
    const now = new Date().toISOString().slice(0, 10);
    setCustomers(prev =>
      prev.map(c => {
        if (!idSet.has(c.id)) return c;
        if (c.tags.includes(trimmed)) return c;
        return { ...c, tags: [...c.tags, trimmed], updatedAt: now };
      })
    );
  };

  // Activity Actions
  const addActivity = (data: Omit<Activity, 'id' | 'createdAt'>): Activity => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newAct: Activity = {
      ...data,
      id: `act-${Date.now()}`,
      createdAt: dateStr,
    };
    setActivities(prev => [newAct, ...prev]);

    // Update customer last contact
    updateCustomer(data.customerId, {
      lastContactAt: dateStr.slice(0, 10),
    });

    // If there is next follow-up date and nextStep, optionally create task
    if (data.nextFollowUpDate && data.nextStep) {
      addTask({
        customerId: data.customerId,
        customerName: data.customerName,
        title: `【跟進】${data.nextStep}`,
        dueDate: data.nextFollowUpDate,
        priority: 'high',
        completed: false,
        assignedTo: data.loggedBy || currentUser.name,
      });
    }

    return newAct;
  };

  const deleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  // Deal Actions
  const addDeal = (data: Omit<Deal, 'id' | 'createdAt'>): Deal => {
    const now = new Date().toISOString().slice(0, 10);
    const newDeal: Deal = {
      ...data,
      id: `deal-${Date.now()}`,
      createdAt: now,
    };
    setDeals(prev => [newDeal, ...prev]);
    return newDeal;
  };

  const updateDeal = (id: string, data: Partial<Deal>) => {
    setDeals(prev =>
      prev.map(d => (d.id === id ? { ...d, ...data } : d))
    );
  };

  const updateDealStage = (id: string, stage: DealStage) => {
    const now = new Date().toISOString().slice(0, 10);
    setDeals(prev =>
      prev.map(d => {
        if (d.id !== id) return d;
        let probability = d.probability;
        if (stage === 'lead') probability = 20;
        else if (stage === 'qualified') probability = 40;
        else if (stage === 'proposal') probability = 60;
        else if (stage === 'negotiating') probability = 80;
        else if (stage === 'won') probability = 100;
        else if (stage === 'lost') probability = 0;

        return {
          ...d,
          stage,
          probability,
          closedAt: stage === 'won' || stage === 'lost' ? now : undefined,
        };
      })
    );
  };

  const deleteDeal = (id: string) => {
    setDeals(prev => prev.filter(d => d.id !== id));
  };

  // Task Actions
  const addTask = (data: Omit<Task, 'id' | 'createdAt'>): Task => {
    const now = new Date().toISOString().slice(0, 10);
    const newTask: Task = {
      ...data,
      id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: now,
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (id: string, data: Partial<Task>) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, ...data } : t))
    );
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Export JSON
  const exportDataJSON = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      customers,
      activities,
      deals,
      tasks,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Customers CSV
  const exportCustomersCSV = () => {
    const headers = [
      '客戶名稱',
      '統一編號',
      '主要聯絡人',
      '職稱',
      'Email',
      '電話',
      '手機',
      '產業類別',
      '分級',
      '客戶來源',
      '狀態',
      '負責業務',
      '標籤',
      '最後聯絡日',
      '年度預算',
    ];

    const rows = customers.map(c => [
      `"${c.companyName.replace(/"/g, '""')}"`,
      `"${c.taxId || ''}"`,
      `"${c.contactPerson}"`,
      `"${c.title}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      `"${c.mobile || ''}"`,
      `"${c.industry}"`,
      `"${c.tier}"`,
      `"${c.source}"`,
      `"${c.status}"`,
      `"${c.assignedTo}"`,
      `"${c.tags.join('; ')}"`,
      `"${c.lastContactAt || ''}"`,
      c.annualBudget || 0,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm_customers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const importDataJSON = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (Array.isArray(parsed.customers)) {
        setCustomers(parsed.customers);
      }
      if (Array.isArray(parsed.activities)) {
        setActivities(parsed.activities);
      }
      if (Array.isArray(parsed.deals)) {
        setDeals(parsed.deals);
      }
      if (Array.isArray(parsed.tasks)) {
        setTasks(parsed.tasks);
      }
      return true;
    } catch {
      return false;
    }
  };

  const resetToDefaults = () => {
    setCustomers(INITIAL_CUSTOMERS);
    setActivities(INITIAL_ACTIVITIES);
    setDeals(INITIAL_DEALS);
    setTasks(INITIAL_TASKS);
    setCurrentUser(INITIAL_SALES_USERS[0]);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.DEALS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
  };

  return (
    <CRMContext.Provider
      value={{
        customers,
        activities,
        deals,
        tasks,
        users,
        currentUser,
        setCurrentUser,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedCustomerId,
        setSelectedCustomerId,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        batchDeleteCustomers,
        batchUpdateOwner,
        batchAddTag,
        addActivity,
        deleteActivity,
        addDeal,
        updateDeal,
        updateDealStage,
        deleteDeal,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        exportDataJSON,
        exportCustomersCSV,
        importDataJSON,
        resetToDefaults,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
