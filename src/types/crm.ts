export type CustomerTier = 'VIP' | 'A' | 'B' | 'C';

export type CustomerStatus = 'lead' | 'contacted' | 'negotiating' | 'customer' | 'churned';

export type CustomerSource = 
  | '線上諮詢' 
  | '展會接觸' 
  | '熟客轉介' 
  | '主動開發' 
  | '數位廣告' 
  | '合作夥伴' 
  | '其他';

export interface Customer {
  id: string;
  companyName: string;
  taxId?: string; // 統一編號
  contactPerson: string;
  title: string; // 職稱
  email: string;
  phone: string;
  mobile?: string;
  address?: string;
  industry: string;
  tier: CustomerTier;
  source: CustomerSource;
  status: CustomerStatus;
  assignedTo: string;
  tags: string[];
  notes?: string;
  annualBudget?: number;
  createdAt: string;
  updatedAt: string;
  lastContactAt?: string;
}

export type ActivityType = 'call' | 'meeting' | 'email' | 'line' | 'proposal' | 'note';
export type ActivityOutcome = 'positive' | 'neutral' | 'negative';

export interface Activity {
  id: string;
  customerId: string;
  customerName?: string;
  type: ActivityType;
  title: string;
  content: string;
  outcome: ActivityOutcome;
  nextStep?: string;
  nextFollowUpDate?: string;
  loggedBy: string;
  createdAt: string;
}

export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiating' | 'won' | 'lost';

export interface Deal {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  amount: number;
  stage: DealStage;
  probability: number; // 0 - 100
  expectedCloseDate: string;
  closedAt?: string;
  lossReason?: string;
  assignedTo: string;
  notes?: string;
  createdAt: string;
}

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  customerId?: string;
  customerName?: string;
  dealId?: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: TaskPriority;
  completed: boolean;
  assignedTo: string;
  notes?: string;
  createdAt: string;
}

export type ActiveNavTab = 'dashboard' | 'customers' | 'deals' | 'tasks' | 'analytics';

export interface SalesUser {
  id: string;
  name: string;
  title: string;
  email: string;
  avatar: string;
}
