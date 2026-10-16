export interface OverviewMetric {
  id: string;
  label: string;
  value: string;
  subValue?: string;
  change: string;
  isPositive: boolean;
  accent: string;
  bg: string;
  iconName: string;
}

export interface OrderLocation {
  id: string;
  orderNumber: string;
  customerName: string;
  address: string;
  lat: number;
  lng: number;
  amount: number;
  status: 'in_transit' | 'delivered' | 'pending';
  itemsCount: number;
  timeAgo: string;
  eta?: string;
  driverName?: string;
}

export interface MonthlyRevenue {
  label: string;
  revenue: number;
  orders: number;
  target?: number;
}

export class OverviewService {
  static getMetrics(): OverviewMetric[] {
    return [
      { id: 'revenue', label: 'Total Revenue', value: '$48,250', subValue: 'Target: $50,000', change: '+12.5%', isPositive: true, accent: '#2563EB', bg: '#EFF6FF', iconName: 'dollar' },
      { id: 'orders', label: 'Total Orders', value: '1,284', subValue: 'Daily avg: 42', change: '+8.2%', isPositive: true, accent: '#7C3AED', bg: '#F5F3FF', iconName: 'orders' },
      { id: 'routes', label: 'Active Routes', value: '18', subValue: '6 zones active', change: '+2', isPositive: true, accent: '#0284C7', bg: '#F0F9FF', iconName: 'truck' },
      { id: 'delivered', label: 'Completed', value: '1,192', subValue: '96.2% success', change: '+14.1%', isPositive: true, accent: '#16A34A', bg: '#F0FDF4', iconName: 'check' },
      { id: 'pending', label: 'Pending Orders', value: '32', subValue: '12 urgent', change: '-5.3%', isPositive: false, accent: '#D97706', bg: '#FFFBEB', iconName: 'clock' },
      { id: 'team', label: 'Team Members', value: '14', subValue: '10 on duty now', change: '+1', isPositive: true, accent: '#0D9488', bg: '#F0FDFA', iconName: 'users' },
    ];
  }

  static getOrders(): OrderLocation[] {
    return [
      { id: 'ord-101', orderNumber: '#ORD-8821', customerName: 'Kavinda Perera', address: '45 Galle Road, Colombo 03', lat: 6.9015, lng: 79.8540, amount: 145.50, status: 'in_transit', itemsCount: 3, timeAgo: '15m ago', eta: '10 mins', driverName: 'Saman Kumara' },
      { id: 'ord-102', orderNumber: '#ORD-8822', customerName: 'Nimasha Fernando', address: '112 Havelock Road, Colombo 05', lat: 6.8864, lng: 79.8698, amount: 89.00, status: 'in_transit', itemsCount: 1, timeAgo: '28m ago', eta: '18 mins', driverName: 'Nuwan Pradeep' },
      { id: 'ord-103', orderNumber: '#ORD-8823', customerName: 'Roshan Silva', address: '78 Kandy Road, Kadawatha', lat: 7.0012, lng: 79.9515, amount: 320.00, status: 'pending', itemsCount: 5, timeAgo: '42m ago', eta: 'Preparing', driverName: 'Unassigned' },
      { id: 'ord-104', orderNumber: '#ORD-8824', customerName: 'Ayesha De Silva', address: '15 Nawala Road, Nugegoda', lat: 6.8785, lng: 79.8974, amount: 210.75, status: 'delivered', itemsCount: 2, timeAgo: '1h ago', eta: 'Delivered', driverName: 'Kasun Bandara' },
      { id: 'ord-105', orderNumber: '#ORD-8825', customerName: 'Dilshan Madusanka', address: '204 High Level Rd, Maharagama', lat: 6.8480, lng: 79.9268, amount: 175.00, status: 'in_transit', itemsCount: 4, timeAgo: '5m ago', eta: '25 mins', driverName: 'Sahan Wickrama' },
      { id: 'ord-106', orderNumber: '#ORD-8826', customerName: 'Chamari Jayasinghe', address: '32 Negombo Road, Wattala', lat: 6.9890, lng: 79.8912, amount: 95.20, status: 'delivered', itemsCount: 2, timeAgo: '2h ago', eta: 'Delivered', driverName: 'Kasun Bandara' },
      { id: 'ord-107', orderNumber: '#ORD-8827', customerName: 'Tharindu Rathnayake', address: '9 Union Place, Colombo 02', lat: 6.9204, lng: 79.8596, amount: 410.00, status: 'pending', itemsCount: 6, timeAgo: '50m ago', eta: 'Packaging', driverName: 'Unassigned' },
      { id: 'ord-108', orderNumber: '#ORD-8828', customerName: 'Fathima Rizwan', address: '67 Sri Jayawardenepura Kotte', lat: 6.8920, lng: 79.9180, amount: 135.00, status: 'delivered', itemsCount: 1, timeAgo: '3h ago', eta: 'Delivered', driverName: 'Dinesh Alwis' },
    ];
  }

  static getMonthlyRevenue(): MonthlyRevenue[] {
    return [
      { label: 'Mon', revenue: 4200, orders: 110, target: 4000 },
      { label: 'Tue', revenue: 5800, orders: 145, target: 4500 },
      { label: 'Wed', revenue: 6400, orders: 160, target: 5000 },
      { label: 'Thu', revenue: 7100, orders: 178, target: 5200 },
      { label: 'Fri', revenue: 8900, orders: 215, target: 6000 },
      { label: 'Sat', revenue: 9400, orders: 240, target: 6500 },
      { label: 'Sun', revenue: 6450, orders: 165, target: 5500 },
    ];
  }
}
