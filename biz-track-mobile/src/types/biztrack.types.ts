export type Currency = 'LKR' | 'USD' | 'INR' | 'EUR';

export interface BusinessSettings {
  businessName: string;
  nextBatch: string;
  currency: Currency;
}

export type OrderStatus = 'pending' | 'delivered';

export interface Order {
  id: string;
  customer: string;
  phone: string;
  address: string;
  quantity: number;
  date: string;
  status: OrderStatus;
  orderImage?: string | null;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
}

export interface WeeklyStats {
  weekOrdersCount: number;
  requestedQty: number;
  deliveredOrdersCount: number;
  pendingLocationsCount: number;
  ordersThisWeek?: number;
  totalQuantityThisWeek?: number;
  deliveredThisWeek?: number;
  pendingLocations?: number;
  nextOrder: Order | null;
  balance: number;
  totalIncome: number;
  totalExpense: number;
}
