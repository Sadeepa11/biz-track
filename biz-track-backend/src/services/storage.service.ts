import { safeQuery } from '../config/database';
import {
  BizTrackData,
  BusinessSettings,
  Order,
  Transaction,
  WeeklyStats,
} from '../types/biztrack.types';

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

const todayDate = (): string => {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
};

export class StorageService {
  // --- Settings ---
  static async getSettings(): Promise<BusinessSettings> {
    const res = await safeQuery(
      'SELECT business_name AS "businessName", next_batch AS "nextBatch", currency FROM business_settings ORDER BY id ASC LIMIT 1'
    );
    if (res.rows.length > 0) {
      return res.rows[0];
    }
    // Default fallback
    return {
      businessName: 'Biz Track Operations',
      nextBatch: nextFridayDate(),
      currency: 'LKR',
    };
  }

  static async updateSettings(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
    const current = await this.getSettings();
    const updated: BusinessSettings = {
      businessName: settings.businessName !== undefined ? settings.businessName.trim() : current.businessName,
      nextBatch: settings.nextBatch || current.nextBatch,
      currency: settings.currency || current.currency,
    };

    const countRes = await safeQuery('SELECT id FROM business_settings ORDER BY id ASC LIMIT 1');
    if (countRes.rows.length > 0) {
      await safeQuery(
        'UPDATE business_settings SET business_name = $1, next_batch = $2, currency = $3 WHERE id = $4',
        [updated.businessName, updated.nextBatch, updated.currency, countRes.rows[0].id]
      );
    } else {
      await safeQuery(
        'INSERT INTO business_settings (business_name, next_batch, currency) VALUES ($1, $2, $3)',
        [updated.businessName, updated.nextBatch, updated.currency]
      );
    }

    return updated;
  }

  // --- Orders ---
  static async getOrders(filters?: { status?: string; search?: string }): Promise<Order[]> {
    let query = 'SELECT id, customer, phone, address, quantity, date, status, order_image AS "orderImage" FROM orders WHERE 1=1';
    const params: unknown[] = [];

    if (filters?.status && filters.status !== 'all') {
      params.push(filters.status);
      query += ` AND status = $${params.length}`;
    }

    if (filters?.search) {
      params.push(`%${filters.search.toLowerCase()}%`);
      const pIdx = params.length;
      query += ` AND (LOWER(customer) LIKE $${pIdx} OR LOWER(phone) LIKE $${pIdx} OR LOWER(address) LIKE $${pIdx})`;
    }

    query += ' ORDER BY date DESC, created_at DESC';

    const res = await safeQuery(query, params);
    return res.rows;
  }

  static async getOrderById(id: string): Promise<Order | null> {
    const res = await safeQuery(
      'SELECT id, customer, phone, address, quantity, date, status, order_image AS "orderImage" FROM orders WHERE id = $1',
      [id]
    );
    return res.rows[0] || null;
  }

  static async addOrder(orderData: Omit<Order, 'id'> & { id?: string }): Promise<Order> {
    const id = orderData.id || `ord-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const date = orderData.date || todayDate();
    const status = orderData.status || 'pending';
    const quantity = Number(orderData.quantity) || 1;
    const orderImage = orderData.orderImage || null;

    const res = await safeQuery(
      `INSERT INTO orders (id, customer, phone, address, quantity, date, status, order_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, customer, phone, address, quantity, date, status, order_image AS "orderImage"`,
      [id, orderData.customer.trim(), orderData.phone.trim(), orderData.address.trim(), quantity, date, status, orderImage]
    );

    return res.rows[0];
  }

  static async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const current = await this.getOrderById(id);
    if (!current) return null;

    const customer = updates.customer !== undefined ? updates.customer.trim() : current.customer;
    const phone = updates.phone !== undefined ? updates.phone.trim() : current.phone;
    const address = updates.address !== undefined ? updates.address.trim() : current.address;
    const quantity = updates.quantity !== undefined ? Number(updates.quantity) : current.quantity;
    const date = updates.date || current.date;
    const status = updates.status || current.status;
    const orderImage = updates.orderImage !== undefined ? updates.orderImage : current.orderImage;

    const res = await safeQuery(
      `UPDATE orders
       SET customer = $1, phone = $2, address = $3, quantity = $4, date = $5, status = $6, order_image = $7
       WHERE id = $8
       RETURNING id, customer, phone, address, quantity, date, status, order_image AS "orderImage"`,
      [customer, phone, address, quantity, date, status, orderImage, id]
    );

    return res.rows[0] || null;
  }

  static async completeDelivery(id: string, imageUrl: string): Promise<Order | null> {
    const res = await safeQuery(
      `UPDATE orders
       SET status = 'delivered', order_image = $1
       WHERE id = $2
       RETURNING id, customer, phone, address, quantity, date, status, order_image AS "orderImage"`,
      [imageUrl, id]
    );
    return res.rows[0] || null;
  }

  static async toggleOrderStatus(id: string): Promise<Order | null> {
    const current = await this.getOrderById(id);
    if (!current) return null;

    const newStatus = current.status === 'delivered' ? 'pending' : 'delivered';
    const res = await safeQuery(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, customer, phone, address, quantity, date, status, order_image AS "orderImage"',
      [newStatus, id]
    );

    return res.rows[0] || null;
  }

  static async deleteOrder(id: string): Promise<boolean> {
    const res = await safeQuery('DELETE FROM orders WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }

  // --- Transactions ---
  static async getTransactions(): Promise<Transaction[]> {
    const res = await safeQuery(
      'SELECT id, type, description, amount::float as amount, date FROM transactions ORDER BY date DESC, created_at DESC'
    );
    return res.rows;
  }

  static async addTransaction(txData: Omit<Transaction, 'id'> & { id?: string }): Promise<Transaction> {
    const id = txData.id || `tx-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const date = txData.date || todayDate();
    const amount = parseFloat(Number(txData.amount).toFixed(2));

    const res = await safeQuery(
      `INSERT INTO transactions (id, type, description, amount, date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, type, description, amount::float as amount, date`,
      [id, txData.type, txData.description.trim(), amount, date]
    );

    return res.rows[0];
  }

  static async deleteTransaction(id: string): Promise<boolean> {
    const res = await safeQuery('DELETE FROM transactions WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }

  // --- Weekly Stats ---
  static async getWeeklyStats(): Promise<WeeklyStats> {
    const now = new Date();
    const day = (now.getDay() + 6) % 7; // Monday = 0
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
    const weekStart = [
      monday.getFullYear(),
      String(monday.getMonth() + 1).padStart(2, '0'),
      String(monday.getDate()).padStart(2, '0'),
    ].join('-');
    const today = todayDate();

    // 1. Orders this week
    const weekOrdersRes = await safeQuery(
      'SELECT id, quantity, status FROM orders WHERE date >= $1 AND date <= $2',
      [weekStart, today]
    );
    const weekOrders = weekOrdersRes.rows;
    const weekOrdersCount = weekOrders.length;
    const requestedQty = weekOrders.reduce((sum, o) => sum + (Number(o.quantity) || 0), 0);
    const deliveredOrdersCount = weekOrders.filter((o) => o.status === 'delivered').length;

    // 2. Pending orders & distinct locations
    const pendingRes = await safeQuery(
      'SELECT id, customer, phone, address, quantity, date, status FROM orders WHERE status != $1 ORDER BY date ASC, created_at ASC',
      ['delivered']
    );
    const pendingOrders = pendingRes.rows;
    const distinctLocations = new Set(pendingOrders.map((o) => o.address.trim().toLowerCase())).size;
    const nextOrder = pendingOrders.length > 0 ? pendingOrders[0] : null;

    // 3. Transactions balance
    const txRes = await safeQuery(
      'SELECT type, SUM(amount)::float AS total FROM transactions GROUP BY type'
    );
    let totalIncome = 0;
    let totalExpense = 0;
    for (const row of txRes.rows) {
      if (row.type === 'income') totalIncome = Number(row.total) || 0;
      if (row.type === 'expense') totalExpense = Number(row.total) || 0;
    }
    const balance = totalIncome - totalExpense;

    return {
      weekOrdersCount,
      requestedQty,
      deliveredOrdersCount,
      pendingLocationsCount: distinctLocations,
      nextOrder,
      balance,
      totalIncome,
      totalExpense,
    };
  }

  // --- Export & Reset ---
  static async exportAll(): Promise<BizTrackData> {
    const settings = await this.getSettings();
    const orders = await this.getOrders();
    const transactions = await this.getTransactions();
    return { settings, orders, transactions };
  }

  static async resetAll(): Promise<void> {
    await safeQuery('DELETE FROM orders');
    await safeQuery('DELETE FROM transactions');
    await safeQuery('DELETE FROM business_settings');
    await safeQuery(
      'INSERT INTO business_settings (business_name, next_batch, currency) VALUES ($1, $2, $3)',
      ['Biz Track Operations', nextFridayDate(), 'LKR']
    );
  }
}
