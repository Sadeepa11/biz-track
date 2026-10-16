import { useState, useMemo } from 'react';
import type { Order } from '../types/biztrack.types';
import OrderCard from '../components/OrderCard';
import { PlusIcon, SearchIcon } from '../components/Icons';

interface OrdersPageProps {
  orders: Order[];
  onToggleStatus: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (order: Order) => void;
  onNewOrder: () => void;
  onViewPhoto?: (order: Order) => void;
}

type FilterStatus = 'all' | 'pending' | 'delivered';

export function OrdersPage({
  orders,
  onToggleStatus,
  onEditOrder,
  onDeleteOrder,
  onNewOrder,
  onViewPhoto,
}: OrdersPageProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');

  const pendingCount = useMemo(
    () => orders.filter((o) => o.status !== 'delivered').length,
    [orders]
  );
  const deliveredCount = useMemo(
    () => orders.filter((o) => o.status === 'delivered').length,
    [orders]
  );

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders
      .filter((o) => {
        if (filter === 'pending' && o.status === 'delivered') return false;
        if (filter === 'delivered' && o.status !== 'delivered') return false;
        if (!term) return true;
        return (
          o.customer.toLowerCase().includes(term) ||
          o.phone.toLowerCase().includes(term) ||
          o.address.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [orders, filter, search]);

  return (
    <div className="space-y-4">
      {/* Page Heading on Mobile & Desktop */}
      <div className="flex items-center justify-between gap-2.5">
        <div>
          <h2 className="text-[23px] font-bold text-[#153765]">Orders</h2>
          <p className="text-[12px] text-[#71829e] mt-0.5">Manage customers and deliveries</p>
        </div>
        <button
          onClick={onNewOrder}
          className="px-4 py-2.5 rounded-xl bg-[#1769e8] hover:bg-[#1258c7] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#1769e829] transition-all cursor-pointer shrink-0"
        >
          <PlusIcon className="w-4 h-4" />
          <span>+ Add Order</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <SearchIcon className="w-4 h-4 text-[#8a99b0] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search name, phone or address"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#dbe9fa] bg-white text-[#203653] placeholder-[#8a99b0] text-xs focus:outline-none focus:ring-2 focus:ring-[#1769e8]/30 focus:border-[#1769e8]"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-2 rounded-full text-xs transition-colors cursor-pointer whitespace-nowrap ${
            filter === 'all'
              ? 'bg-[#edf5ff] text-[#1769e8] border border-[#b9d5ff] font-bold'
              : 'bg-white text-[#5d7291] border border-[#dbe9fa] hover:border-[#b9d5ff]'
          }`}
        >
          All ({orders.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3.5 py-2 rounded-full text-xs transition-colors cursor-pointer whitespace-nowrap ${
            filter === 'pending'
              ? 'bg-[#edf5ff] text-[#1769e8] border border-[#b9d5ff] font-bold'
              : 'bg-white text-[#5d7291] border border-[#dbe9fa] hover:border-[#b9d5ff]'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('delivered')}
          className={`px-3.5 py-2 rounded-full text-xs transition-colors cursor-pointer whitespace-nowrap ${
            filter === 'delivered'
              ? 'bg-[#edf5ff] text-[#1769e8] border border-[#b9d5ff] font-bold'
              : 'bg-white text-[#5d7291] border border-[#dbe9fa] hover:border-[#b9d5ff]'
          }`}
        >
          Delivered ({deliveredCount})
        </button>
      </div>

      {/* Order Cards List / Desktop Grid */}
      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              compact={false}
              onToggleStatus={onToggleStatus}
              onEdit={onEditOrder}
              onDelete={onDeleteOrder}
              onViewPhoto={onViewPhoto}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 text-[#71829e] border border-dashed border-[#dbe9fa] rounded-2xl bg-white text-[13px]">
          No matching orders found.
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
