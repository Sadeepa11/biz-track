import type {
  BusinessSettings,
  Order,
  Transaction,
  WeeklyStats,
} from '../types/biztrack.types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const LOCAL_STORAGE_KEY = 'biz-track-data-v3';

const todayDate = (): string => {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
};

const nextFridayDate = (): string => {
  const d = new Date();
  let add = (5 - d.getDay() + 7) % 7;
  if (!add) add = 7;
  d.setDate(d.getDate() + add);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
};

// Initial default state without hardcoded ghost data
export const getInitialData = () => ({
  settings: {
    businessName: 'Biz Track',
    nextBatch: nextFridayDate(),
    currency: 'LKR' as const,
  },
  orders: [] as Order[],
  transactions: [] as Transaction[],
});

// Helper for local storage backup
export function getLocalData() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.settings && Array.isArray(parsed.orders) && Array.isArray(parsed.transactions)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read from local storage:', e);
  }
  const init = getInitialData();
  saveLocalData(init);
  return init;
}

export function saveLocalData(data: ReturnType<typeof getInitialData>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not write to local storage:', e);
  }
}

// REST API calls with live Neon synchronization & graceful offline fallback
export const biztrackApi = {
  // Settings
  async getSettings(): Promise<{ data: BusinessSettings; isRemote: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/settings`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`API failed: ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        // Sync live settings to local storage
        const local = getLocalData();
        local.settings = json.data;
        saveLocalData(local);
        return { data: json.data, isRemote: true };
      }
      throw new Error('Invalid response');
    } catch {
      const local = getLocalData();
      return { data: local.settings, isRemote: false };
    }
  },

  async updateSettings(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
    const local = getLocalData();
    local.settings = { ...local.settings, ...settings };
    saveLocalData(local);

    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          local.settings = json.data;
          saveLocalData(local);
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Could not sync settings to backend, saved locally:', e);
    }
    return local.settings;
  },

  // Orders
  async getOrders(params?: { status?: string; search?: string }): Promise<{ data: Order[]; isRemote: boolean }> {
    try {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.search) query.append('search', params.search);

      const res = await fetch(`${API_BASE}/orders?${query.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`API failed: ${res.status}`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        // Cache full order list when not filtering by search/status
        if (!params || (!params.status && !params.search)) {
          const local = getLocalData();
          local.orders = json.data;
          saveLocalData(local);
        }
        return { data: json.data, isRemote: true };
      }
      throw new Error('Invalid orders response');
    } catch {
      const local = getLocalData();
      let list = [...local.orders];
      if (params?.status && params.status !== 'all') {
        list = list.filter((o: Order) => o.status === params.status);
      }
      if (params?.search) {
        const q = params.search.toLowerCase().trim();
        list = list.filter((o: Order) =>
          o.customer.toLowerCase().includes(q) ||
          o.phone.toLowerCase().includes(q) ||
          o.address.toLowerCase().includes(q)
        );
      }
      return { data: list.sort((a, b) => b.date.localeCompare(a.date)), isRemote: false };
    }
  },

  async createOrder(order: Omit<Order, 'id'>): Promise<Order> {
    const tempId = 'ord-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const newOrder: Order = {
      ...order,
      id: tempId,
    };

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const local = getLocalData();
          local.orders = [json.data, ...local.orders.filter((o: Order) => o.id !== tempId && o.id !== json.data.id)];
          saveLocalData(local);
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Backend createOrder failed, saving locally:', e);
    }

    const local = getLocalData();
    local.orders.unshift(newOrder);
    saveLocalData(local);
    return newOrder;
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    // Immediately persist update locally
    const local = getLocalData();
    const idx = local.orders.findIndex((o: Order) => o.id === id);
    if (idx !== -1) {
      local.orders[idx] = { ...local.orders[idx], ...updates };
      saveLocalData(local);
    }

    try {
      const res = await fetch(`${API_BASE}/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const l = getLocalData();
          const lIdx = l.orders.findIndex((o: Order) => o.id === id);
          if (lIdx !== -1) {
            l.orders[lIdx] = json.data;
          } else {
            l.orders.push(json.data);
          }
          saveLocalData(l);
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Backend updateOrder failed, using local update:', e);
    }

    return local.orders[idx] || (updates as Order);
  },

  async toggleOrderStatus(id: string): Promise<Order> {
    const local = getLocalData();
    const order = local.orders.find((o: Order) => o.id === id);
    if (order) {
      order.status = order.status === 'delivered' ? 'pending' : 'delivered';
      saveLocalData(local);
    }

    try {
      const res = await fetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PATCH',
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const l = getLocalData();
          const lIdx = l.orders.findIndex((o: Order) => o.id === id);
          if (lIdx !== -1) l.orders[lIdx] = json.data;
          saveLocalData(l);
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Backend toggleOrderStatus failed, using local change:', e);
    }
    return order!;
  },

  async completeDelivery(id: string, imageBase64: string): Promise<Order> {
    const local = getLocalData();
    const idx = local.orders.findIndex((o: Order) => o.id === id);
    if (idx !== -1) {
      local.orders[idx] = {
        ...local.orders[idx],
        status: 'delivered',
        orderImage: imageBase64,
      };
      saveLocalData(local);
    }

    try {
      const res = await fetch(`${API_BASE}/orders/${id}/deliver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 }),
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const l = getLocalData();
          const lIdx = l.orders.findIndex((o: Order) => o.id === id);
          if (lIdx !== -1) l.orders[lIdx] = json.data;
          saveLocalData(l);
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Backend completeDelivery failed, using local update:', e);
    }
    return local.orders[idx];
  },

  async deleteOrder(id: string): Promise<boolean> {
    // Immediately delete from local storage
    const local = getLocalData();
    local.orders = local.orders.filter((o: Order) => o.id !== id);
    saveLocalData(local);

    try {
      const res = await fetch(`${API_BASE}/orders/${id}`, {
        method: 'DELETE',
        cache: 'no-store',
      });
      if (!res.ok) {
        console.warn('Backend deleteOrder returned status', res.status);
      }
    } catch (e) {
      console.warn('Backend deleteOrder network error:', e);
    }
    return true;
  },

  // Transactions
  async getTransactions(): Promise<{ data: Transaction[]; isRemote: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/transactions`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`API failed: ${res.status}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const local = getLocalData();
        local.transactions = json.data;
        saveLocalData(local);
        return { data: json.data, isRemote: true };
      }
      throw new Error('Invalid transactions response');
    } catch {
      const local = getLocalData();
      return {
        data: local.transactions.sort((a: Transaction, b: Transaction) => b.date.localeCompare(a.date)),
        isRemote: false,
      };
    }
  },

  async createTransaction(tx: Omit<Transaction, 'id'>): Promise<Transaction> {
    const tempId = 'tx-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const newTx: Transaction = {
      ...tx,
      id: tempId,
    };

    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTx),
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const local = getLocalData();
          local.transactions = [json.data, ...local.transactions.filter((t: Transaction) => t.id !== tempId && t.id !== json.data.id)];
          saveLocalData(local);
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Backend createTransaction failed, saving locally:', e);
    }

    const local = getLocalData();
    local.transactions.unshift(newTx);
    saveLocalData(local);
    return newTx;
  },

  async deleteTransaction(id: string): Promise<boolean> {
    const local = getLocalData();
    local.transactions = local.transactions.filter((t: Transaction) => t.id !== id);
    saveLocalData(local);

    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'DELETE',
        cache: 'no-store',
      });
      if (!res.ok) {
        console.warn('Backend deleteTransaction returned status', res.status);
      }
    } catch (e) {
      console.warn('Backend deleteTransaction network error:', e);
    }
    return true;
  },

  // Stats
  async getStats(): Promise<{ data: WeeklyStats; isRemote: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/stats`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`API failed: ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        return { data: json.data, isRemote: true };
      }
      throw new Error('Invalid stats response');
    } catch {
      // Calculate locally from current local storage
      const local = getLocalData();
      const now = new Date();
      const day = (now.getDay() + 6) % 7;
      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
      const weekStart = [
        monday.getFullYear(),
        String(monday.getMonth() + 1).padStart(2, '0'),
        String(monday.getDate()).padStart(2, '0'),
      ].join('-');
      const today = todayDate();

      const weekOrders = local.orders.filter(
        (o: Order) => o.date >= weekStart && o.date <= today
      );
      const pending = local.orders
        .filter((o: Order) => o.status !== 'delivered')
        .sort((a: Order, b: Order) => a.date.localeCompare(b.date));
      const delivered = weekOrders.filter((o: Order) => o.status === 'delivered');
      const requestedQty = weekOrders.reduce((s: number, o: Order) => s + Number(o.quantity), 0);
      const locations = new Set(pending.map((o: Order) => o.address.trim().toLowerCase())).size;

      const income = local.transactions
        .filter((t: Transaction) => t.type === 'income')
        .reduce((s: number, t: Transaction) => s + Number(t.amount), 0);
      const expense = local.transactions
        .filter((t: Transaction) => t.type === 'expense')
        .reduce((s: number, t: Transaction) => s + Number(t.amount), 0);

      return {
        data: {
          weekOrdersCount: weekOrders.length,
          requestedQty,
          deliveredOrdersCount: delivered.length,
          pendingLocationsCount: locations,
          nextOrder: pending.length ? pending[0] : null,
          balance: income - expense,
          totalIncome: income,
          totalExpense: expense,
        },
        isRemote: false,
      };
    }
  },

  // Reset
  async resetAll(): Promise<void> {
    saveLocalData(getInitialData());
    try {
      await fetch(`${API_BASE}/reset`, { method: 'POST', cache: 'no-store' });
    } catch {}
  },
};
