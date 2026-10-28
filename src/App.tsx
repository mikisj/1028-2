import React, { useState, useEffect } from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CustomerListView } from './components/CustomerListView';
import { DealKanbanView } from './components/DealKanbanView';
import { TaskScheduleView } from './components/TaskScheduleView';
import { AnalyticsView } from './components/AnalyticsView';
import { CustomerDetailModal } from './components/CustomerDetailModal';
import { CustomerFormModal } from './components/CustomerFormModal';
import { DealFormModal } from './components/DealFormModal';
import { TaskFormModal } from './components/TaskFormModal';
import { DataManagementModal } from './components/DataManagementModal';
import { Customer, Deal, Task } from './types/crm';

const CRMAppContent: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    selectedCustomerId, 
    setSelectedCustomerId,
    customers,
  } = useCRM();

  // Modals state
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [showDealModal, setShowDealModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [defaultDealCustomerId, setDefaultDealCustomerId] = useState<string | undefined>(undefined);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultTaskCustomerId, setDefaultTaskCustomerId] = useState<string | undefined>(undefined);

  const [showDataModal, setShowDataModal] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close modals
      if (e.key === 'Escape') {
        if (showCustomerModal) setShowCustomerModal(false);
        else if (showDealModal) setShowDealModal(false);
        else if (showTaskModal) setShowTaskModal(false);
        else if (showDataModal) setShowDataModal(false);
        else if (selectedCustomerId) setSelectedCustomerId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCustomerModal, showDealModal, showTaskModal, showDataModal, selectedCustomerId, setSelectedCustomerId]);

  // Handlers
  const handleOpenNewCustomer = () => {
    setEditingCustomer(null);
    setShowCustomerModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleOpenNewDeal = (customerId?: string) => {
    setEditingDeal(null);
    setDefaultDealCustomerId(customerId);
    setShowDealModal(true);
  };

  const handleEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    setDefaultDealCustomerId(deal.customerId);
    setShowDealModal(true);
  };

  const handleOpenNewTask = (customerId?: string) => {
    setEditingTask(null);
    setDefaultTaskCustomerId(customerId);
    setShowTaskModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDefaultTaskCustomerId(task.customerId);
    setShowTaskModal(true);
  };

  const handleLogActivityForCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
  };

  const selectedCustomerObj = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onOpenNewCustomer={handleOpenNewCustomer}
        onOpenNewDeal={() => handleOpenNewDeal()}
        onOpenNewTask={() => handleOpenNewTask()}
        onOpenDataModal={() => setShowDataModal(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Dynamic Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenNewCustomer={handleOpenNewCustomer}
              onOpenNewDeal={() => handleOpenNewDeal()}
              onOpenNewTask={() => handleOpenNewTask()}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerListView
              onOpenNewCustomer={handleOpenNewCustomer}
              onEditCustomer={handleEditCustomer}
              onLogActivityForCustomer={handleLogActivityForCustomer}
            />
          )}

          {activeTab === 'deals' && (
            <DealKanbanView
              onOpenNewDeal={() => handleOpenNewDeal()}
              onEditDeal={handleEditDeal}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskScheduleView
              onOpenNewTask={() => handleOpenNewTask()}
              onEditTask={handleEditTask}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView />
          )}
        </main>
      </div>

      {/* Modals */}
      {/* 1. Customer 360° Drawer Modal */}
      {selectedCustomerId && (
        <CustomerDetailModal
          onClose={() => setSelectedCustomerId(null)}
          onEditCustomer={() => {
            if (selectedCustomerObj) {
              handleEditCustomer(selectedCustomerObj);
            }
          }}
          onAddDealForCustomer={() => {
            if (selectedCustomerObj) {
              handleOpenNewDeal(selectedCustomerObj.id);
            }
          }}
          onAddTaskForCustomer={() => {
            if (selectedCustomerObj) {
              handleOpenNewTask(selectedCustomerObj.id);
            }
          }}
        />
      )}

      {/* 2. Customer Form Modal */}
      {showCustomerModal && (
        <CustomerFormModal
          customer={editingCustomer}
          onClose={() => setShowCustomerModal(false)}
        />
      )}

      {/* 3. Deal Form Modal */}
      {showDealModal && (
        <DealFormModal
          deal={editingDeal}
          defaultCustomerId={defaultDealCustomerId}
          onClose={() => setShowDealModal(false)}
        />
      )}

      {/* 4. Task Form Modal */}
      {showTaskModal && (
        <TaskFormModal
          task={editingTask}
          defaultCustomerId={defaultTaskCustomerId}
          onClose={() => setShowTaskModal(false)}
        />
      )}

      {/* 5. Data Export & Backup Modal */}
      {showDataModal && (
        <DataManagementModal
          onClose={() => setShowDataModal(false)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <CRMProvider>
      <CRMAppContent />
    </CRMProvider>
  );
}
