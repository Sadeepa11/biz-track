import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type {
  BusinessSettings,
  Order,
  Transaction,
  WeeklyStats,
} from '../types/biztrack.types';

const STORAGE_KEY = 'biz-track-data-v3';

// Dynamically determine candidate backend API URLs to guarantee seamless connectivity
// whether running on a physical phone via Wi-Fi, Android emulator, iOS simulator, or Web.
const getCandidateApiBases = (): string[] => {
  const candidates: string[] = [];

  // 1. Explicit environment variable if configured
  if (process.env.EXPO_PUBLIC_API_URL) {
    candidates.push(process.env.EXPO_PUBLIC_API_URL);
  }

  // 2. Dynamic host IP from Expo packager / bundler URL (e.g. 192.168.8.151)
  const hostUri = Constants.expoConfig?.hostUri || (Constants.manifest2 as any)?.extra?.expoClient?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      candidates.push(`http://${ip}:5000/api`);
    }
  }

  // 3. Known Local LAN IP
  candidates.push('http://192.168.8.151:5000/api');

  // 4. Android emulator loopback
  if (Platform.OS === 'android') {
    candidates.push('http://10.0.2.2:5000/api');
  }

  // 5. Localhost fallback (iOS Simulator / Web)
  candidates.push('http://localhost:5000/api');

  return Array.from(new Set(candidates));
};

let activeApiBase: string | null = null;

/**
 * Perform fetch with candidate fallback to ensure 100% connectivity to the backend
 */
async function requestApi(path: string, options: RequestInit = {}): Promise<Response> {
  const candidates = activeApiBase
    ? [activeApiBase, ...getCandidateApiBases().filter((c) => c !== activeApiBase)]
    : getCandidateApiBases();

  let lastError: any;
  for (const base of candidates) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${base}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...(options.headers || {}),
        },
      });
      clearTimeout(timer);
      if (res.ok) {
        activeApiBase = base;
        return res;
      }
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error(`Cannot connect to backend at any candidate URL for ${path}`);
}

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

// Clean initial state with NO dummy/sample data
export const getInitialData = () => ({
  settings: {
    businessName: 'Biz Track',
    nextBatch: nextFridayDate(),
    currency: 'LKR' as const,
  },
  orders: [] as Order[],
  transactions: [] as Transaction[],
});

export const biztrackStorage = {
  async getLocalData() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.settings && Array.isArray(parsed.orders) && Array.isArray(parsed.transactions)) {
          return parsed;
        }
      }
    } catch {}
    const initial = getInitialData();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  },

  async saveLocalData(data: ReturnType<typeof getInitialData>) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  },

  // Settings
  async getSettings(): Promise<BusinessSettings> {
    try {
      const res = await requestApi('/settings', { method: 'GET' });
      const json = await res.json();
      if (json.success && json.data) {
        const local = await this.getLocalData();
        local.settings = json.data;
        await this.saveLocalData(local);
        return json.data;
      }
    } catch (e) {
      console.warn('Could not fetch settings from Neon backend, using local:', e);
    }
    const local = await this.getLocalData();
    return local.settings;
  },

  async updateSettings(settings: BusinessSettings): Promise<BusinessSettings> {
    const local = await this.getLocalData();
    local.settings = settings;
    await this.saveLocalData(local);

    try {
      const res = await requestApi('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success && json.data) {
        local.settings = json.data;
        await this.saveLocalData(local);
        return json.data;
      }
    } catch (e) {
      console.warn('Could not update settings in Neon backend:', e);
    }
    return local.settings;
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    try {
      const res = await requestApi('/orders', { method: 'GET' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const local = await this.getLocalData();
        local.orders = json.data;
        await this.saveLocalData(local);
        return json.data;
      }
    } catch (e) {
      console.warn('Could not fetch orders from Neon backend, using local:', e);
    }
    const local = await this.getLocalData();
    return local.orders.sort((a: Order, b: Order) => b.date.localeCompare(a.date));
  },

  async createOrder(order: Omit<Order, 'id'>): Promise<Order> {
    const tempId = 'ord-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const newOrder: Order = {
      ...order,
      id: tempId,
    };

    try {
      const res = await requestApi('/orders', {
        method: 'POST',
        body: JSON.stringify(newOrder),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const local = await this.getLocalData();
        local.orders = [json.data, ...local.orders.filter((o: Order) => o.id !== tempId && o.id !== json.data.id)];
        await this.saveLocalData(local);
        return json.data;
      }
    } catch (e) {
      console.warn('Could not create order in Neon backend, stored locally:', e);
    }

    const local = await this.getLocalData();
    local.orders.unshift(newOrder);
    await this.saveLocalData(local);
    return newOrder;
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const local = await this.getLocalData();
    const idx = local.orders.findIndex((o: Order) => o.id === id);
    if (idx !== -1) {
      local.orders[idx] = { ...local.orders[idx], ...updates };
      await this.saveLocalData(local);
    }

    try {
      const res = await requestApi(`/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const l = await this.getLocalData();
        const lIdx = l.orders.findIndex((o: Order) => o.id === id);
        if (lIdx !== -1) l.orders[lIdx] = json.data;
        await this.saveLocalData(l);
        return json.data;
      }
    } catch (e) {
      console.warn('Could not update order in Neon backend:', e);
    }
    return local.orders[idx] || (updates as Order);
  },

  async toggleOrderStatus(id: string): Promise<Order> {
    const local = await this.getLocalData();
    const order = local.orders.find((o: Order) => o.id === id);
    if (order) {
      order.status = order.status === 'delivered' ? 'pending' : 'delivered';
      await this.saveLocalData(local);
    }

    try {
      const res = await requestApi(`/orders/${id}/status`, { method: 'PATCH' });
      const json = await res.json();
      if (json.success && json.data) {
        const l = await this.getLocalData();
        const lIdx = l.orders.findIndex((o: Order) => o.id === id);
        if (lIdx !== -1) l.orders[lIdx] = json.data;
        await this.saveLocalData(l);
        return json.data;
      }
    } catch (e) {
      console.warn('Could not toggle order status in Neon backend:', e);
    }
    return order!;
  },

  async deleteOrder(id: string): Promise<boolean> {
    const local = await this.getLocalData();
    local.orders = local.orders.filter((o: Order) => o.id !== id);
    await this.saveLocalData(local);

    try {
      await requestApi(`/orders/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Could not delete order from Neon backend:', e);
    }
    return true;
  },

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    try {
      const res = await requestApi('/transactions', { method: 'GET' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const local = await this.getLocalData();
        local.transactions = json.data;
        await this.saveLocalData(local);
        return json.data;
      }
    } catch (e) {
      console.warn('Could not fetch transactions from Neon backend:', e);
    }
    const local = await this.getLocalData();
    return local.transactions.sort((a: Transaction, b: Transaction) =>
      b.date.localeCompare(a.date)
    );
  },

  async createTransaction(tx: Omit<Transaction, 'id'>): Promise<Transaction> {
    const tempId = 'tx-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const newTx: Transaction = {
      ...tx,
      id: tempId,
    };

    try {
      const res = await requestApi('/transactions', {
        method: 'POST',
        body: JSON.stringify(newTx),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const local = await this.getLocalData();
        local.transactions = [json.data, ...local.transactions.filter((t: Transaction) => t.id !== tempId && t.id !== json.data.id)];
        await this.saveLocalData(local);
        return json.data;
      }
    } catch (e) {
      console.warn('Could not create transaction in Neon backend:', e);
    }

    const local = await this.getLocalData();
    local.transactions.unshift(newTx);
    await this.saveLocalData(local);
    return newTx;
  },

  async deleteTransaction(id: string): Promise<boolean> {
    const local = await this.getLocalData();
    local.transactions = local.transactions.filter((t: Transaction) => t.id !== id);
    await this.saveLocalData(local);

    try {
      await requestApi(`/transactions/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Could not delete transaction in Neon backend:', e);
    }
    return true;
  },

  // Weekly stats
  async getStats(): Promise<WeeklyStats> {
    try {
      const res = await requestApi('/stats', { method: 'GET' });
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    } catch (e) {
      console.warn('Could not fetch stats from Neon backend, calculating locally:', e);
    }

    const local = await this.getLocalData();
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
      weekOrdersCount: weekOrders.length,
      requestedQty,
      deliveredOrdersCount: delivered.length,
      pendingLocationsCount: locations,
      ordersThisWeek: weekOrders.length,
      totalQuantityThisWeek: requestedQty,
      deliveredThisWeek: delivered.length,
      pendingLocations: locations,
      nextOrder: pending.length ? pending[0] : null,
      balance: income - expense,
      totalIncome: income,
      totalExpense: expense,
    };
  },

  async resetAll(): Promise<void> {
    await this.saveLocalData(getInitialData());
    try {
      await requestApi('/reset', { method: 'POST' });
    } catch {}
  },
};
