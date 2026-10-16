import type { Order, WeeklyStats, BusinessSettings } from '../types/biztrack.types';
import OrderCard from '../components/OrderCard';
import { OrdersIcon, QtyIcon, DeliveredIcon, LocationIcon, PlusIcon } from '../components/Icons';

interface HomePageProps {
  stats: WeeklyStats;
  orders: Order[];
  settings: BusinessSettings;
  onToggleStatus: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (order: Order) => void;
  onNavigateToOrders: () => void;
  onNewOrder: () => void;
}

export function HomePage({
  stats,
  orders,
  settings,
  onToggleStatus,
  onEditOrder,
  onDeleteOrder,
  onNavigateToOrders,
  onNewOrder,
}: HomePageProps) {
  const pendingOrders = orders
    .filter((o) => o.status !== 'delivered')
    .sort((a, b) => a.date.localeCompare(b.date));

  const nextOrder = pendingOrders.length > 0 ? pendingOrders[0] : null;
  const subsequentPending = pendingOrders.slice(1);

  return (
    <div className="space-y-6">
      {/* Desktop Header Banner */}
      <div className="hidden md:flex items-center justify-between p-5 bg-gradient-to-r from-[#edf5ff] to-white border border-[#dbe9fa] rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#153765]">
            Welcome to {settings.businessName || 'Biz Track'}
          </h2>
          <p className="text-xs text-[#71829e] mt-1">
            Streamlined order tracking, dispatch scheduling, and financial balance.
          </p>
        </div>
        <button
          onClick={onNewOrder}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1769e8] hover:bg-[#1258c7] text-white text-xs font-bold shadow-md shadow-[#1769e829] transition-all cursor-pointer"
        >
          <PlusIcon className="w-4 h-4" />
          <span>New Order</span>
        </button>
      </div>

      {/* Weekly Overview Header */}
      <div>
        <div className="flex items-center justify-between mb-3 px-0.5">
          <h2 className="text-[17px] font-bold text-[#153765]">Weekly Overview</h2>
          <small className="text-[11px] text-[#71829e] font-medium">This week</small>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Orders */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#dbe9fa] shadow-xs flex flex-col justify-between min-h-[120px]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#edf5ff] text-[#1769e8] flex items-center justify-center shrink-0">
                <OrdersIcon className="w-5 h-5" />
              </div>
              <span className="text-[12px] font-semibold text-[#445873]">Orders</span>
            </div>
            <div>
              <strong className="block text-[28px] font-bold text-[#153765] leading-none mt-2">
                {stats.weekOrdersCount ?? stats.ordersThisWeek ?? 0}
              </strong>
              <small className="text-[10px] text-[#71829e] mt-1 block">This week so far</small>
            </div>
          </div>

          {/* Requested Quantity */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#dbe9fa] shadow-xs flex flex-col justify-between min-h-[120px]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#edf5ff] text-[#1769e8] flex items-center justify-center shrink-0">
                <QtyIcon className="w-5 h-5" />
              </div>
              <span className="text-[12px] font-semibold text-[#445873]">Requested Qty.</span>
            </div>
            <div>
              <strong className="block text-[28px] font-bold text-[#153765] leading-none mt-2">
                {stats.requestedQty ?? stats.totalQuantityThisWeek ?? 0}
              </strong>
              <small className="text-[10px] text-[#71829e] mt-1 block">Items requested</small>
            </div>
          </div>

          {/* Delivered Orders */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#dbe9fa] shadow-xs flex flex-col justify-between min-h-[120px]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#edf5ff] text-[#1769e8] flex items-center justify-center shrink-0">
                <DeliveredIcon className="w-5 h-5" />
              </div>
              <span className="text-[12px] font-semibold text-[#445873]">Delivered Orders</span>
            </div>
            <div>
              <strong className="block text-[28px] font-bold text-[#153765] leading-none mt-2">
                {stats.deliveredOrdersCount ?? stats.deliveredThisWeek ?? 0}
              </strong>
              <small className="text-[10px] text-[#71829e] mt-1 block">This week</small>
            </div>
          </div>

          {/* Locations */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#dbe9fa] shadow-xs flex flex-col justify-between min-h-[120px]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#edf5ff] text-[#1769e8] flex items-center justify-center shrink-0">
                <LocationIcon className="w-5 h-5" />
              </div>
              <span className="text-[12px] font-semibold text-[#445873]">Locations</span>
            </div>
            <div>
              <strong className="block text-[28px] font-bold text-[#153765] leading-none mt-2">
                {stats.pendingLocationsCount ?? stats.pendingLocations ?? 0}
              </strong>
              <small className="text-[10px] text-[#71829e] mt-1 block">Pending delivery stops</small>
            </div>
          </div>
        </div>
      </div>

      {/* Next Order / Delivery Queue Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Order Spotlight (Left 2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-[17px] font-bold text-[#153765]">Next Order</h2>
            <small className="text-[11px] text-[#71829e] font-medium">Delivery queue</small>
          </div>

          {nextOrder ? (
            <div>
              <OrderCard
                order={nextOrder}
                compact={false}
                onToggleStatus={onToggleStatus}
                onEdit={onEditOrder}
                onDelete={onDeleteOrder}
              />
            </div>
          ) : (
            <div className="text-center py-10 px-4 text-[#71829e] border border-dashed border-[#dbe9fa] rounded-2xl bg-white text-[13px]">
              No pending orders. Add an order to get started.
            </div>
          )}

          {/* Subsequent pending stops if any */}
          {subsequentPending.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between px-0.5">
                <h3 className="text-xs font-bold text-[#153765] uppercase tracking-wider">
                  Upcoming Queue ({subsequentPending.length})
                </h3>
                <button
                  onClick={onNavigateToOrders}
                  className="text-xs font-bold text-[#1769e8] hover:underline cursor-pointer"
                >
                  View all orders →
                </button>
              </div>

              <div className="space-y-2">
                {subsequentPending.slice(0, 3).map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    compact={true}
                    onToggleStatus={onToggleStatus}
                    onEdit={onEditOrder}
                    onDelete={onDeleteOrder}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column on Desktop: Summary & Shortcuts */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-[#dbe9fa] shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#153765] uppercase tracking-wider">
              Batch Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-[#edf2f9]">
                <span className="text-[#71829e]">Pending Deliveries</span>
                <b className="text-[#1769e8] font-bold">{pendingOrders.length} orders</b>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#edf2f9]">
                <span className="text-[#71829e]">Pending Quantity</span>
                <b className="text-[#153765] font-bold">
                  {pendingOrders.reduce((acc, o) => acc + (o.quantity || 0), 0)} items
                </b>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#edf2f9]">
                <span className="text-[#71829e]">Completed Deliveries</span>
                <b className="text-[#4a6a93] font-bold">
                  {orders.filter((o) => o.status === 'delivered').length} orders
                </b>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#71829e]">Total Orders Database</span>
                <b className="text-[#153765] font-bold">{orders.length} orders</b>
              </div>
            </div>

            <button
              onClick={onNavigateToOrders}
              className="w-full py-2.5 rounded-xl border border-[#dbe9fa] bg-[#f6f9fe] hover:bg-[#edf5ff] text-[#153765] text-xs font-bold transition-colors cursor-pointer"
            >
              Open Orders Page
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#f2f7ff] border border-[#d5e6ff] text-xs space-y-1.5">
            <strong className="block text-[#153765] font-bold">💡 Fast Dispatch</strong>
            <p className="text-[#6a80a0] leading-relaxed">
              Click <span className="font-semibold text-[#1769e8]">Google Maps</span> on any order card to immediately open GPS routing on your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
