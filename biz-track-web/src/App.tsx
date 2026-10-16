import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  BusinessSettings,
  Order,
  Transaction,
  WeeklyStats,
  TransactionType,
} from './types/biztrack.types';
import { biztrackApi, getInitialData } from './services/biztrackApi';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import OrderDialog from './components/OrderDialog';
import TransactionDialog from './components/TransactionDialog';
import Toast from './components/Toast';
import HomePage from './pages/HomePage';
import OrdersPage from './pages/OrdersPage';
import MoneyPage from './pages/MoneyPage';
import SettingsPage from './pages/SettingsPage';
import SplashScreen from './components/SplashScreen';
import DeliveryProofDialog from './components/DeliveryProofDialog';

export type AppTab = 'home' | 'orders' | 'money' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [settings, setSettings] = useState<BusinessSettings>(() => getInitialData().settings);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<WeeklyStats>(() => ({
    weekOrdersCount: 0,
    requestedQty: 0,
    deliveredOrdersCount: 0,
    pendingLocationsCount: 0,
    nextOrder: null,
    balance: 0,
    totalIncome: 0,
    totalExpense: 0,
  }));
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>('income');

  // Delivery Proof states
  const [deliveringOrder, setDeliveringOrder] = useState<Order | null>(null);
  const [viewingPhotoOrder, setViewingPhotoOrder] = useState<Order | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  const hideToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  // Compute pending orders count for sidebar & badge
  const pendingOrdersCount = useMemo(
    () => orders.filter((o) => o.status !== 'delivered').length,
    [orders]
  );

  // Load all initial data
  const loadData = useCallback(async () => {
    try {
      const startTime = Date.now();
      const [settingsRes, ordersRes, txRes, statsRes] = await Promise.all([
        biztrackApi.getSettings(),
        biztrackApi.getOrders(),
        biztrackApi.getTransactions(),
        biztrackApi.getStats(),
      ]);

      setSettings(settingsRes.data);
      setOrders(ordersRes.data);
      setTransactions(txRes.data);
      setStats(statsRes.data);
      setIsBackendConnected(
        settingsRes.isRemote || ordersRes.isRemote || txRes.isRemote || statsRes.isRemote
      );

      const elapsed = Date.now() - startTime;
      const delay = Math.max(0, 500 - elapsed);
      setTimeout(() => setIsLoading(false), delay);
    } catch (e) {
      console.warn('Fallback to local storage', e);
      setIsBackendConnected(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Recalculate stats when orders/transactions change
  const refreshStats = useCallback(async () => {
    const statsRes = await biztrackApi.getStats();
    setStats(statsRes.data);
    setIsBackendConnected(statsRes.isRemote);
  }, []);

  // --- Order Actions ---
  const handleOpenNewOrder = () => {
    setEditingOrder(null);
    setOrderDialogOpen(true);
  };

  const handleOpenEditOrder = (order: Order) => {
    setEditingOrder(order);
    setOrderDialogOpen(true);
  };

  const handleSaveOrder = async (orderData: Omit<Order, 'id'> & { id?: string }) => {
    try {
      if (orderData.id) {
        const updated = await biztrackApi.updateOrder(orderData.id, orderData);
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        showToast('Order updated successfully');
      } else {
        const created = await biztrackApi.createOrder(orderData);
        setOrders((prev) => [created, ...prev]);
        showToast('Order added successfully');
      }
      setOrderDialogOpen(false);
      setEditingOrder(null);
      await refreshStats();
    } catch {
      showToast('Error saving order');
    }
  };

  const handleToggleOrderStatus = async (order: Order) => {
    if (order.status !== 'delivered') {
      // Open proof photo capture modal
      setDeliveringOrder(order);
    } else {
      if (!confirm(`Revert order #${order.id.slice(-5)} for ${order.customer} back to Pending?`)) return;
      try {
        const updated = await biztrackApi.toggleOrderStatus(order.id);
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        showToast('Marked as Pending');
        await refreshStats();
      } catch {
        showToast('Error updating status');
      }
    }
  };

  const handleConfirmDelivery = async (orderId: string, imageBase64: string) => {
    try {
      showToast('☁️ Uploading proof photo to R2...');
      const updated = await biztrackApi.completeDelivery(orderId, imageBase64);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      showToast('✓ Delivery completed with photo proof!');
      await refreshStats();
    } catch {
      showToast('Error completing delivery');
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    if (!confirm(`Delete order for ${order.customer}?`)) return;
    try {
      await biztrackApi.deleteOrder(order.id);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      showToast('Order deleted');
      await refreshStats();
    } catch {
      showToast('Error deleting order');
    }
  };

  // --- Transaction Actions ---
  const handleOpenTransaction = (type: TransactionType) => {
    setTransactionType(type);
    setTransactionDialogOpen(true);
  };

  const handleSaveTransaction = async (data: {
    type: TransactionType;
    description: string;
    amount: number;
    date: string;
  }) => {
    try {
      const created = await biztrackApi.createTransaction(data);
      setTransactions((prev) => [created, ...prev]);
      showToast(data.type === 'income' ? 'Income recorded' : 'Expense recorded');
      await refreshStats();
    } catch {
      showToast('Error recording transaction');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await biztrackApi.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      showToast('Transaction deleted');
      await refreshStats();
    } catch {
      showToast('Error deleting transaction');
    }
  };

  // --- Settings Actions ---
  const handleSaveSettings = async (newSettings: BusinessSettings) => {
    try {
      const saved = await biztrackApi.updateSettings(newSettings);
      setSettings(saved);
      showToast('Settings saved');
    } catch {
      showToast('Error saving settings');
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      settings,
      orders,
      transactions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const today = new Date().toISOString().split('T')[0];
    a.download = `biz-track-backup-${today}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Backup downloaded');
  };

  const handleResetData = async () => {
    try {
      await biztrackApi.resetAll();
      await loadData();
      showToast('App data reset complete');
    } catch {
      showToast('Error resetting data');
    }
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <div className="h-screen bg-[#f6f9fe] text-[#203653] font-sans flex flex-col md:flex-row antialiased overflow-hidden">
      {/* Desktop Left Sidebar (>= md) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        pendingOrdersCount={pendingOrdersCount}
        isBackendConnected={isBackendConnected}
      />

      {/* Main Content Area - independently scrollable */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-y-auto pb-24 md:pb-8">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 pt-5 md:hidden">
          <Header
            activeTab={activeTab}
            settings={settings}
            isBackendConnected={isBackendConnected}
            onOpenOrderDialog={handleOpenNewOrder}
            onOpenTransactionDialog={handleOpenTransaction}
          />
        </div>

        {/* Tab Content */}
        <main className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6 flex-1">
          {activeTab === 'home' && (
            <HomePage
              stats={stats}
              orders={orders}
              settings={settings}
              onToggleStatus={handleToggleOrderStatus}
              onEditOrder={handleOpenEditOrder}
              onDeleteOrder={handleDeleteOrder}
              onNavigateToOrders={() => setActiveTab('orders')}
              onNewOrder={handleOpenNewOrder}
              onViewPhoto={(order) => setViewingPhotoOrder(order)}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersPage
              orders={orders}
              onToggleStatus={handleToggleOrderStatus}
              onEditOrder={handleOpenEditOrder}
              onDeleteOrder={handleDeleteOrder}
              onNewOrder={handleOpenNewOrder}
              onViewPhoto={(order) => setViewingPhotoOrder(order)}
            />
          )}

          {activeTab === 'money' && (
            <MoneyPage
              transactions={transactions}
              settings={settings}
              onOpenIncomeDialog={() => handleOpenTransaction('income')}
              onOpenExpenseDialog={() => handleOpenTransaction('expense')}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onExportBackup={handleExportBackup}
              onResetData={handleResetData}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation (< md) */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Modals & Dialogs */}
      <OrderDialog
        isOpen={orderDialogOpen}
        order={editingOrder}
        onClose={() => {
          setOrderDialogOpen(false);
          setEditingOrder(null);
        }}
        onSave={handleSaveOrder}
      />

      <TransactionDialog
        isOpen={transactionDialogOpen}
        type={transactionType}
        currency={settings.currency || 'LKR'}
        onClose={() => setTransactionDialogOpen(false)}
        onSubmit={handleSaveTransaction}
      />

      {/* Delivery Proof Modals */}
      <DeliveryProofDialog
        isOpen={!!deliveringOrder}
        mode="capture"
        order={deliveringOrder}
        onClose={() => setDeliveringOrder(null)}
        onConfirmDelivery={handleConfirmDelivery}
      />

      <DeliveryProofDialog
        isOpen={!!viewingPhotoOrder}
        mode="view"
        order={viewingPhotoOrder}
        onClose={() => setViewingPhotoOrder(null)}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={hideToast} />
    </div>
  );
}
